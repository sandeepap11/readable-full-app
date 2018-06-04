import { combineReducers } from 'redux';
import {
  LOAD_POSTS_FOR_CATEGORY, LOAD_ALL_POSTS, ADD_NEW_POST, GET_POST, ADD_NEW_COMMENT, SET_CATEGORY,
  LOAD_CATEGORIES, VOTE_POST, VOTE_COMMENT, UPDATE_POST, UPDATE_COMMENT, DELETE_POST, DELETE_COMMENT
} from '../actions';

function categories(state = {}, action) {

  const { categories, category } = action;
  switch (action.type) {

    case SET_CATEGORY:

      return {
        ...state,
        category: category
      };


    case LOAD_CATEGORIES:
      return {
        ...state,
        categories: categories
      };

    default:
      return state;
  }
}

function posts(state = {}, action) {

  const { category, posts, post, comments, comment, option } = action;
  let vote = 1;
  switch (action.type) {

    case LOAD_ALL_POSTS:

      return {

        ...state,
        posts: posts.reduce((result, post) => {
          result[post.id] = Object.entries(post).filter((post) => !post.deleted).reduce((object, entry) => {
            object[entry[0]] = entry[1];
            return object
          }, {});
          return result
        }, {})
      };


    case LOAD_POSTS_FOR_CATEGORY:

      return {

        ...state,
        posts: posts.filter((post) => post.category === category && !post.deleted).reduce((result, post) => {
          result[post.id] = Object.entries(post).reduce((object, entry) => {
            object[entry[0]] = entry[1];
            return object
          }, {});
          return result
        }, {})
      };

    case ADD_NEW_POST:

      return {

        ...state,
        posts: {
          ...state.posts,
          [post.id]: post
        }
      };

    case GET_POST:

    if(post.message){
      return {
        ...state,
        message: post.message
      }
    }
    
    
      return {
        ...state,
        posts: {
          ...state.posts,
          [post.id]: {
            ...post,
            comments: comments.map(comment => comment.id)
          }
        },
        comments: comments.reduce((result, comment) => {
          result[comment.id] = Object.entries(comment).reduce((object, entry) => {
            object[entry[0]] = entry[1];
            return object
          }, {});
          return result
        }, {})

      };

    case ADD_NEW_COMMENT:

      return {

        ...state,
        posts: {
          ...state.posts,
          [comment.parentId]: {
            ...state.posts[comment.parentId],
            comments: state.posts[comment.parentId].comments.concat(comment.id),
            commentCount: state.posts[comment.parentId].commentCount + 1
          }
        },
        comments: {
          ...state.comments,
          [comment.id]: comment
        }
      };

    case VOTE_POST:
      if (option === "downVote") {
        vote = -1;
      }

      return {
        ...state,
        posts: {
          ...state.posts,
          [post.id]: {
            ...state.posts[post.id],
            voteScore: state.posts[post.id].voteScore + vote
          }

        }

      }

    case VOTE_COMMENT:
      if (option === "downVote") {
        vote = -1;
      }

      return {
        ...state,
        comments: {
          ...state.comments,
          [comment.id]: {
            ...state.comments[comment.id],
            voteScore: state.comments[comment.id].voteScore + vote
          }
        }
      }

    case UPDATE_POST:

      return {
        ...state,
        posts: {
          ...state.posts,
          [post.id]: {
            ...state.posts[post.id],
            title: post.title,
            category: post.category,
            body: post.body,
            author: post.author,
            timestamp: post.timestamp

          }
        }
      }

    case UPDATE_COMMENT:

      return {
        ...state,
        comments: {
          ...state.comments,
          [comment.id]: {
            ...state.comments[comment.id],
            author: comment.author,
            timestamp: comment.timestamp,
            body: comment.body

          }
        }
      }

    case DELETE_POST:

      return {
        ...state,
        posts: {
          ...state.posts,
          [post.id]: {
            ...state.posts[post.id],
            deleted: true

          }
        }
      }

    case DELETE_COMMENT:
      return {
        ...state,
        posts: {
          ...state.posts,
          [comment.parentId]: {
            ...state.posts[comment.parentId],
            commentCount: state.posts[comment.parentId].commentCount - 1
          }
        },
        comments: {
          ...state.comments,
          [comment.id]: {
            ...state.comments[comment.id],
            deleted: true
          }
        }
      }

    default:
      return state;
  }
}

export default combineReducers({ posts, categories })
