import React, { Component } from 'react';
import { connect } from 'react-redux';
import Modal from 'react-modal';
import ReactLoading from 'react-loading'
import PropTypes from 'prop-types';
import serializeForm from 'form-serialize';
import capitalize from 'capitalize';
import Scrollable from './Scrollable';
import PostView from './PostView';
import ErrorPage from './ErrorPage';
import { setCategory, fetchAllPosts, fetchPostsForCategory, addNewPost } from '../actions';
import * as PostUtils from '../utils/PostUtils';
import '../css/ListPost.css';

class ListPost extends Component {

  static propTypes = {
    posts: PropTypes.object.isRequired,
    categories: PropTypes.array.isRequired,
    category: PropTypes.string.isRequired
  };

  // Define state for modal, search and sorting
  state = {
    addPostsModalOpen: false,
    keyword: "",
    sorter: {
      ascending: false,
      timestamp: true
    }
  };

  /**
     * @description Opens the New Post modal     
  **/
  openAddPostsModal = () => {
    this.setState({
      addPostsModalOpen: true
    });
  }

  /**
     * @description Closes the New Post modal     
  **/
  closeAddPostsModalOpen = () => {
    this.setState({
      addPostsModalOpen: false
    });

  };

  /**
     * @description Enables / disables submit button based on whether
     *   all required fields are filled or not.
  **/
  changedPost = () => {

    if (this.title.value === "" || this.author.value === "" || this.body.value === "") {
      this.button.disabled = true;
    }
    else {
      this.button.disabled = false;
    }

  };

  /**
     * @description Submits a new post and closes the New Post Modal
     * @param {Event} event - The event contains form data
  **/
  submitPost = (event) => {

    event.preventDefault();
    const post = serializeForm(event.target, {
      hash: true
    });

    post["timestamp"] = (new Date()).getTime();
    post["id"] = PostUtils.getUUID();
    post["voteScore"] = 1;
    post["commentCount"] = 0;

    if (this.props.category !== "all")
      post["category"] = this.props.category;

    this.props.newPost(post);
    this.closeAddPostsModalOpen();
  };

  /**
     * @description Sets the selected sorting mechanism
     * @param {string} target - The select element
  **/
  sortSelect = (target) => {
    const selector = target.value.split("-");
    let ascending = true,
      timestamp = true;

    if (selector[0] === "false")
      ascending = false;

    if (selector[1] === "false")
      timestamp = false;

    this.setState({
      sorter: {
        ascending,
        timestamp
      }
    });
  };

  /**
     * @description Sort a list of posts based on selected way of sorting
     * @param {array} postsToSort
     * @returns {array} Sorted array based on user selection
  **/
  sortPosts = (postsToSort) => {

    const { sorter } = this.state;

    if (!sorter.timestamp) {
      if (sorter.ascending) {
        return postsToSort.sort((firstPost, nextPost) => (firstPost.voteScore - nextPost.voteScore));
      }
      else {
        return postsToSort.sort((firstPost, nextPost) => (nextPost.voteScore - firstPost.voteScore));
      }
    }
    else {
      if (sorter.ascending) {
        return postsToSort.sort((firstPost, nextPost) => (firstPost.timestamp - nextPost.timestamp));
      }
      else {
        return postsToSort.sort((firstPost, nextPost) => (nextPost.timestamp - firstPost.timestamp));
      }
    }

  };

  /**
     * @description Sets query string for search
     * @param {string} input
  **/
  search = (input) => {

    this.setState({
      keyword: input.value.toUpperCase().trim()
    });

  };

  /**
     * @description Clears query string for search
  **/
  clearSearch = () => {

    this.searchInput.value = "";
    this.setState({
      keyword: ""
    });
  }

  // Sets the category on the list page and gets posts based on it
  componentDidMount() {

    Modal.setAppElement("body");

    let selectedCategory = "all";

    if (this.props.match) {

      selectedCategory = this.props.match.params.category;
    }

    if (selectedCategory === "all") {
      this.props.fetchPosts();
    } else {
      this.props.fetchCategoryPosts(selectedCategory);
    };

    this.props.setSelectedCategory(selectedCategory);

  }

  // Sets the category on changes and gets posts based on it
  componentWillReceiveProps(nextProps) {

    if (nextProps.match && this.props.match.params.category !== nextProps.match.params.category) {

      let selectedCategory = "all";
      selectedCategory = nextProps.match.params.category;

      if (selectedCategory === "all") {
        nextProps.fetchPosts();
      } else {
        nextProps.fetchCategoryPosts(selectedCategory);
      }
      nextProps.setSelectedCategory(selectedCategory);
    }
  }

  render() {

    const { addPostsModalOpen, keyword } = this.state;
    const { posts, categories, category, loaded } = this.props;

    let sortedPosts = [];

    if (Object.keys(posts).length > 0) {
      sortedPosts = Object.keys(posts).forEach((key, value) => value);
      sortedPosts = Object.values(posts);
      sortedPosts = this.sortPosts(sortedPosts);

    }

    return (
      <div>
        {
          // Show loading bars until posts are retrieved
          !loaded && <ReactLoading delay={100} type="bars" color="#663399" className="loading" />
        }

        {
          (categories.includes(category) || category === "all") &&
          <button className="btn-add-post" onClick={this.openAddPostsModal} > New Post </button>
        }

        {
          // Error message for invalid category
          loaded && (!categories.includes(category) && category !== "all") &&
          <ErrorPage message={`The category, ${category} is not available.`} />
        }

        {
          // Message when posts list is empty
          (loaded && (categories.includes(category) || category === "all") && sortedPosts.filter((post) => !post.deleted && (post.category === category || category === "all")).length === 0) &&
          (
            <div className="no-results">
              <p>No posts available <span onClick={this.openAddPostsModal}>Click to add a post!</span></p>
            </div>
          )
        }

        {
          // When posts are available show sorting options, search bar and posts list
          (loaded && sortedPosts.filter((post) => !post.deleted && (post.category === category || category === "all")).length !== 0) &&
          (
            <div className="posts" >
              <div className="posts-header" >
                <h1 className="posts-heading" > {capitalize.words(`${category} posts`)} </h1>
                <div className="search">
                  <input type="text" name="search" placeholder={`Search ${capitalize(category)} Posts by Title / Author / Body`} onChange={(e) => this.search(e.target)} ref={(searchInput) => this.searchInput = searchInput} />
                  <button onClick={() => this.clearSearch()}></button>
                </div>

                <div className="posts-sort" >
                  <select onChange={(event) => this.sortSelect(event.target)}>
                    <option value="false-true" > Newest First </option>
                    <option value="true-true" > Oldest First </option>
                    <option value="false-false" > Most Popular First </option>
                    <option value="true-false" > Least Popular First </option>
                  </select>
                </div >

              </div>
              <div className="search-count"><p>{`Showing ${sortedPosts.filter((post) =>
                !post.deleted && (post.category === category || category === "all") && (
                  post.title.toUpperCase().includes(keyword)
                  || post.author.toUpperCase().includes(keyword)
                  || post.body.toUpperCase().includes(keyword))).length}
               of ${sortedPosts.filter((post) =>
                  !post.deleted && (post.category === category || category === "all")).length}
                 ${capitalize(category)} posts`}</p></div>
              <Scrollable>
                {
                  (sortedPosts.length > 0) &&
                  <ul >
                    {
                      sortedPosts.filter((post) =>
                        (post.title.toUpperCase().includes(keyword)
                          || post.author.toUpperCase().includes(keyword)
                          || post.body.toUpperCase().includes(keyword)) && (post.category === category || category === "all"))
                        .map(post => (< li className="posts-list"
                          key={post.id} >
                          <PostView post={post} showComments={false} />
                        </li>))
                    }

                  </ul>
                }
              </Scrollable>
            </div>
          )
        }

        {
          // Modal for New Post 
        }
        <Modal className="modal"
          overlayClassName="overlay"
          isOpen={addPostsModalOpen}
          onRequestClose={this.closeAddPostsModalOpen}
          contentLabel="Modal" >
          {
            addPostsModalOpen &&
            <div>
              <button className="modal-close"
                onClick={this.closeAddPostsModalOpen} >
              </button>
              <h1 className="modal-heading" > New {category === "all" ? "" : `${capitalize(category)} `}Post </h1>
              <form onSubmit={this.submitPost} >
                <input type="text" ref={(title) => this.title = title} onChange={() => this.changedPost()} name="title" placeholder="Enter Title" required />
                <input type="text" ref={(author) => this.author = author} onChange={() => this.changedPost()} name="author" placeholder="Enter Username" required />
                {category === "all" &&
                  <select name="category" >
                    {
                      categories.map((thisCategory) => (<option value={thisCategory} key={thisCategory}>
                        {capitalize.words(thisCategory)} </option>))
                    }
                  </select>}
                <textarea name="body" ref={(body) => this.body = body} onChange={() => this.changedPost()} placeholder="Write something ..." required />
                <button disabled name="body" ref={(button) => this.button = button}> Post </button>
              </form>
            </div>
          }
        </Modal>
      </div>
    );

  };
}

function mapStateToProps({ posts, categories }) {
  let postList = {}, categoryList = [], category = "", loaded = false;


  if (categories.categories) {
    categoryList = categories.categories.reduce((result, category) => {
      result.push(category.name);
      return result;
    }, []);
  }

  if (posts.posts) {

    postList = posts.posts;
    loaded = true;
  }

  if (categories.category) {
    category = categories.category;
  }

  return {
    posts: postList, categories: categoryList, category, loaded
  };
}

function mapDispatchToProps(dispatch) {
  return {
    fetchPosts: () => {
      dispatch(fetchAllPosts());
    },
    fetchCategoryPosts: (data) => {
      dispatch(fetchPostsForCategory(data));
    },
    newPost: (data) => {
      dispatch(addNewPost(data));
    },
    setSelectedCategory: (data) => {
      dispatch(setCategory(data))
    }
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(ListPost);