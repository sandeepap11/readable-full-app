import * as ReadableAPI from '../utils/ReadableAPI';

export const SET_CATEGORY = "SET_CATEGORY";
export const LOAD_CATEGORIES = "LOAD_CATEGORIES";
export const LOAD_ALL_POSTS = "LOAD_ALL_POSTS";
export const LOAD_POSTS_FOR_CATEGORY = "LOAD_POSTS_FOR_CATEGORY";
export const ADD_NEW_POST = "ADD_NEW_POST";
export const GET_POST = "GET_POST";
export const ADD_NEW_COMMENT = "ADD_NEW_COMMENT";
export const VOTE_POST = "VOTE_POST";
export const VOTE_COMMENT = "VOTE_COMMENT";
export const UPDATE_POST = "UPDATE_POST";
export const UPDATE_COMMENT = "UPDATE_COMMENT";
export const DELETE_POST = "DELETE_POST";
export const DELETE_COMMENT = "DELETE_COMMENT";

export const setCategory = (category) => {

  return {
    type: SET_CATEGORY,
    category
  }

};

export const loadCategories = (categories) => {

  return {
    type: LOAD_CATEGORIES,
    categories

  }

};

export const fetchCategories = () => dispatch => {

  ReadableAPI
    .getCategories()
    .then(categories => dispatch(loadCategories(categories)));
};

export const loadAllPosts = (posts) => {

  return {
    type: LOAD_ALL_POSTS,
    posts

  }

};

export const fetchAllPosts = () => dispatch => {

  ReadableAPI
    .getPosts()
    .then(posts => dispatch(loadAllPosts(posts)));
};

export const loadPostsForCategory = (category, posts) => {

  return {
    type: LOAD_POSTS_FOR_CATEGORY,
    category,
    posts

  }

};

export const fetchPostsForCategory = (category) => dispatch => {

  ReadableAPI
    .getCategoryPosts(category)
    .then(posts => dispatch(loadPostsForCategory(category, posts)));
};

export const createNewPost = (post) => {

  return {
    type: ADD_NEW_POST,
    post

  }

};

export const addNewPost = (post) => dispatch => {

  ReadableAPI
    .createPost(post)
    .then(post => dispatch(createNewPost(post)));
};

export const getPost = (post, comments) => {

  return {
    type: GET_POST,
    post,
    comments

  }

};

export const fetchPostById = (postId) => dispatch => {

  ReadableAPI
    .getPost(postId)
    .then(post => {

      if (!post.error) {

        ReadableAPI
          .getComments(postId)
          .then(comments => {
            dispatch(getPost(post, comments))
          });
      }
      else {
        dispatch(getPost({ message: "error" }, []))
      }


    });
};

export const addNewComment = (comment) => {

  return {
    type: ADD_NEW_COMMENT,
    comment

  }

}

export const fetchAddNewComment = (comment) => dispatch => {

  ReadableAPI
    .comment(comment)
    .then(comment => dispatch(addNewComment(comment)));
};

export const votePost = (post, option) => {

  return {
    type: VOTE_POST,
    post,
    option

  }

}

export const fetchVotePost = (postId, option) => dispatch => {

  ReadableAPI
    .votePost(postId, option)
    .then(post => dispatch(votePost(post, option)));
};

export const voteComment = (comment, option) => {

  return {
    type: VOTE_COMMENT,
    comment,
    option

  }

}

export const fetchVoteComment = (commentId, option) => dispatch => {

  ReadableAPI
    .voteComment(commentId, option)
    .then(comment => dispatch(voteComment(comment, option)));
};

export const updatePost = (post) => {

  return {
    type: UPDATE_POST,
    post

  }

};

export const fetchUpdatePost = (postId, body) => dispatch => {

  ReadableAPI
    .updatePost(postId, body)
    .then(post => dispatch(updatePost(post)));
};

export const updateComment = (comment) => {

  return {
    type: UPDATE_COMMENT,
    comment

  }

};

export const fetchUpdateComment = (commentId, body) => dispatch => {

  ReadableAPI
    .updateComment(commentId, body)
    .then(comment => dispatch(updateComment(comment)));
};

export const deletePost = (post) => {

  return {
    type: DELETE_POST,
    post

  }

};

export const fetchDeletePost = (postId) => dispatch => {

  ReadableAPI
    .deletePost(postId)
    .then(post => dispatch(deletePost(post)));
};

export const deleteComment = (comment) => {

  return {
    type: DELETE_COMMENT,
    comment

  }
};

export const fetchDeleteComment = (commentId) => dispatch => {

  ReadableAPI
    .deleteComment(commentId)
    .then(comment => dispatch(deleteComment(comment)));
};