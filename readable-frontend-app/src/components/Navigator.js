import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import capitalize from 'capitalize';
import { fetchCategories, setCategory } from '../actions';
import '../css/Navigator.css';

class Navigator extends Component {

  // Component for enclosing site header and side bar for all pages

  static propTypes = {
    categories: PropTypes.array.isRequired,
    category: PropTypes.string.isRequired
  };

  componentDidMount() {
    this.props.getCategories();
    this.props.setSelectedCategory("all");
  }

  render() {

    const { categories, category } = this.props;

    return (<div>
      <div className="top-bar" >
        <Link to="/" >
          <div className="home-icon" > </div> </Link >
        <h1 className="title" > < Link to="/" > READABLE! </Link></h1>
      </div>

      <div className="categories">
        <h3> CATEGORIES </h3> <div>

          <ul> {
            categories.map(
              thisCategory =>
                (
                  (<Link key={thisCategory} to={`/${thisCategory}`}>
                    {(thisCategory === category) &&
                      <li className="selected-category">
                        {capitalize.words(thisCategory)}
                      </li >}
                    {(thisCategory !== category) &&
                      <li className=" ">
                        {capitalize.words(thisCategory)}
                      </li >}
                  </Link>)
                )
            )
          }
          </ul> </div >
      </div>
    </div>);
  };
}

function mapStateToProps({ categories }) {

  let categoriesList = [], category = "";

  if (categories.categories) {

    categoriesList = categories.categories.reduce((result, category) => {
      result.push(category.name);
      return result;

    }, []);
  }

  if (categories.category) {
    category = categories.category;
  }

  return { categories: categoriesList, category };
}

function mapDispatchToProps(dispatch) {
  return {
    getCategories: () => {
      dispatch(fetchCategories())
    },
    setSelectedCategory: (data) => {
      dispatch(setCategory(data))
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Navigator);