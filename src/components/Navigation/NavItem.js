import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'gatsby';
import {
  HeaderMenu,
  HeaderMenuItem,
} from 'carbon-components-react/lib/components/UIShell';

export default class NavItem extends React.Component {
  static propTypes = {
    /**
     * The data structure for the nav item.
     */
    item: PropTypes.shape({
      title: PropTypes.string,
    }),

    /**
     * The key of the nav item.
     */
    itemSlug: PropTypes.string,

    /**
     * The location object.
     */
    location: PropTypes.object,
  };

  state = {
    open: false,
  };

  static getDerivedStateFromProps(props, state) {
    const { location, itemSlug } = props;
    const { open, prevLocation, prevItemSlug } = state;
    return prevLocation === location && prevItemSlug === itemSlug
      ? null
      : {
          open:
            open ||
            (location && itemSlug && locationContainsPath(location, itemSlug)),
          prevLocation: location,
          prevItemSlug: itemSlug,
        };
  }

  toggleSubNav = () => {
    this.setState({
      open: !this.state.open,
    });
  };

  renderSubNavItems = (subItems, location, itemSlug) => {
    return Object.keys(subItems).map(item => {
      // Check that the itemSlug (top most nav item w/ chidlren) matches the
      // zeroeth indexed normalized path array item. This is so we avoid conflicting
      // children with similar names but disimilar parents.
      const isNavItemActive = locationContainsPath(location, [itemSlug, item]);

      const navItemProps = {
        element: Link,
        to: `/${this.props.itemSlug}/${item}`,
        key: item,
      };

      if (isNavItemActive) {
        navItemProps['aria-current'] = 'page';
      }

      return (
        <HeaderMenuItem {...navItemProps}>
          {subItems[item].title}
        </HeaderMenuItem>
      );
    });
  };

  render() {
    const { item, itemSlug } = this.props;
    const hasSubNav = !(item['sub-nav'] === undefined);

    const menuItemProps = {
      title: item.title,
      className: 'test'
    };

    return (
      <>
        {hasSubNav ? (
          <HeaderMenu {...menuItemProps} aria-label={item.title}>
            <HeaderMenuItem to={`/${itemSlug}`} element={Link} className="nav-hack">
              {item.title}
            </HeaderMenuItem>
            {this.renderSubNavItems(item['sub-nav'], location, itemSlug)}
          </HeaderMenu>
          
        ) : (
          <HeaderMenuItem to={`/${itemSlug}`} element={Link}>
            {item.title}
          </HeaderMenuItem>
        )}
      </>
    );
  }
}

/**
 * Normalize the location object provided to us through @reach/router. We also
 * make sure to clean the __PATH_PREFIX__ defined in gatsby-config.js so that
 * we can work with our paths as if they did not have that prefix. This is
 * useful for asserting locations in the pathname for our nav sub-items
 * @param {string|string[]} path The path(s).
 * @returns {string[]} The path tokens, with empty ones filtered out.
 */
function normalizePath(path) {
  const paths = Array.isArray(path) ? path : [path];
  return paths.reduce(
    (a, item) => [
      ...a,
      ...item
        .replace(__PATH_PREFIX__, '')
        .split('/')
        .filter(Boolean),
    ],
    []
  );
}

/**
 * Helper to determine if the location from @reach/router has the given path
 * @param {Object} location The location object.
 * @param {string|string[]} path The path(s).
 * @returns {boolean} `true` if the location from @reach/router has the given path(s).
 */
function locationContainsPath(location, path) {
  const paths = normalizePath(path);
  const locationParts = normalizePath(location.pathname);
  return paths.every((path, i) => path === locationParts[i]);
}
