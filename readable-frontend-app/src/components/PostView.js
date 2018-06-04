import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import Modal from 'react-modal';
import ReactLoading from 'react-loading'
import PropTypes from 'prop-types';
import serializeForm from 'form-serialize';
import capitalize from 'capitalize';
import Comment from './Comment';
import {
    fetchVotePost, fetchAddNewComment,
    fetchUpdatePost, fetchUpdateComment, fetchDeletePost, fetchDeleteComment
} from '../actions';
import * as PostUtils from '../utils/PostUtils';
import '../css/PostView.css';

class PostView extends Component {

    // Defines a single Post

    static propTypes = {
        post: PropTypes.object.isRequired,
        showComments: PropTypes.bool,
        comments: PropTypes.object.isRequired,
        categories: PropTypes.array.isRequired,
        category: PropTypes.string.isRequired
    };

    state = {
        editPostModal: false,
        editCommentModal: false,
        openPromptModal: false,
        commentToEdit: {},
        type: "",
        id: ""
    };

    /**
     * @description This method submits a new comment
     * @param {Event} event - The event contains form data
     * @param {string} postId - The parent post
    **/
    submitComment = (event, postId) => {

        event.preventDefault();
        const comment = serializeForm(event.target, {
            hash: true
        });

        event.target.reset();
        this.nButton.disabled = true;

        comment["timestamp"] = (new Date()).getTime();
        comment["id"] = PostUtils.getUUID();
        comment["voteScore"] = 1;
        comment["parentId"] = postId;

        this.props.newComment(comment);

    };

    /**
     * @description This method updates the votes
     * @param {string} postId
     * @param {string} option - Upvote or Downvote
     **/
    votePost = (postId, option) => {
        this.props.postVote(postId, option);
    };

    /**
     * @description This method enables / disables edit post submit button based on whether
     *   post values have changed or not, or if they are empty or not
    **/
    changedPost = () => {
        const { post } = this.props;

        if (this.title.value === "" || this.author.value === "" || this.body.value === "") {
            this.button.disabled = true;
        }
        else if ((this.title.value !== post.title) ||
            (this.author.value !== post.author) ||
            (this.category.value !== post.category) ||
            (this.body.value !== post.body)) {
            this.button.disabled = false;
        }
        else {
            this.button.disabled = true;
        }

    };

    /**
     * @description This method submits an edited post
     * @param {Event} event - The event contains form data
     * @param {string} postId
    **/
    submitPost = (event, postId) => {
        const { showComments } = this.props;

        event.preventDefault();
        const post = serializeForm(event.target, {
            hash: true
        });

        post["timestamp"] = (new Date()).getTime();

        this.props.editPost(postId, post);
        this.closeEditPostModal();

        if (showComments) {
            this.props.history.push(`/${post.category}/${postId}`);
        }

    };

    /**
     * @description Opens the Edit Post modal     
    **/
    openEditPostModal = () => {
        this.setState({ editPostModal: true });

    };

    /**
     * @description Closes the Edit Post modal     
    **/
    closeEditPostModal = () => {
        this.setState({
            editPostModal: false
        });
    };

    /**
     * @description This method enables / disables edit comment submit button based on whether
     *   comment values have changed or not, or if they are empty or not
    **/
    changedComment = () => {
        const { commentToEdit } = this.state;

        if (this.cAuthor.value === "" || this.cBody.value === "") {
            this.cButton.disabled = true;
        }
        else if ((this.cAuthor.value !== commentToEdit.author) ||
            (this.cBody.value !== commentToEdit.body)) {
            this.cButton.disabled = false;
        }
        else {
            this.cButton.disabled = true;
        }

    };

    /**
     * @description This method submits an edited comment
     * @param {Event} event - The event contains form data
    **/
    submitEditedComment = (event) => {

        event.preventDefault();
        const comment = serializeForm(event.target, {
            hash: true
        });

        comment["timestamp"] = (new Date()).getTime();

        this.props.editComment(this.state.commentToEdit.id, comment);
        this.closeEditCommentModal();
    };

    /**
     * @description Opens the Edit Comment modal     
    **/
    openEditCommentModal = (commentToEdit) => {
        this.setState({ commentToEdit, editCommentModal: true });
    };

    /**
     * @description Closes the Edit Comment modal     
    **/
    closeEditCommentModal = () => {
        this.setState({
            editCommentModal: false
        });

    };

    /**
     * @description This method activates a delete prompt when user tries to delete a Post or Comment
     * @param {string} type - Post or Comment
     * @param {string} id - Id of the Post or Comment
    **/
    deletePrompt = (type, id) => {

        this.setState({
            openPromptModal: true, type, id
        });

    };

    /**
     * @description Deletes a post or comment based on the type and id set via deletePrompt method     
    **/
    deleteItem = () => {
        const { type, id } = this.state;
        const { category, showComments } = this.props;

        if (type === "post") {
            this.props.removePost(id);
            if (showComments) {
                if (category === "all") {
                    this.props.history.push("/");
                }
                else {
                    this.props.history.push(`/${category}`);
                }
            }
        }
        else {
            this.props.removeComment(id);
        }
        this.closePromptModal();
    };

    /**
     * @description Closes the delete prompt
    **/
    closePromptModal = () => {
        this.setState({
            openPromptModal: false
        });
    };

    /**
     * @description Validates the new comment form and enables button when values are present
    **/
    newComment = () => {

        if (this.nAuthor.value === "" || this.nBody.value === "") {
            this.nButton.disabled = true;
        }

        else {
            this.nButton.disabled = false;
        }

    }


    render() {
        const { post, showComments, comments, category, categories, loaded } = this.props;
        const { editPostModal, editCommentModal, commentToEdit, openPromptModal } = this.state;

        const postComments = post.comments ?
            post.comments.sort(
                (firstComment, nextComment) =>
                    (comments[nextComment].timestamp - comments[firstComment].timestamp)
            ) :
            [];



        return (

            <div>
                {(post.deleted === false && <div className="post">
                    {showComments ? (<h2 title={post.title} className="post-view-header"> {post.title} </h2>)
                        : (<Link to={`/${post.category}/${post.id}`}><h2 title={post.title}> {post.title} </h2></Link>)}
                    <div className="fine-details">
                        <p> {`@${post.author}`} </p>
                        <p><Link to={`/${post.category}`}>{capitalize(post.category)}</Link></p>
                        {showComments ? (<p>{PostUtils.getDate(post.timestamp)}</p>)
                            : (<p><Link to={`/${post.category}/${post.id}`}> {PostUtils.getDate(post.timestamp)}</Link></p>)}
                    </div>
                    <div className="post-body" >
                        <p > {post.body} </p>
                    </div>
                    <div className="post-counts" >
                        <div className="votes">
                            <div className="upvote" onClick={() => { this.votePost(post.id, "upVote") }}></div>
                            <p className="vote-value">{post.voteScore} </p>
                            <div className="downvote" onClick={() => { this.votePost(post.id, "downVote") }}></div>
                        </div>

                        <div className="comment-icon">
                            {showComments ? (<div className="comments"></div>)
                                : (<Link to={`/${post.category}/${post.id}`}><div className="comments"></div></Link>)}
                            <p> {post.commentCount} </p>
                        </div>
                        <div className="edit-item" onClick={this.openEditPostModal}></div>
                        <div className="delete-item" onClick={() => this.deletePrompt("post", post.id)}></div>
                    </div>
                    {(showComments) && (
                        <form className="add-comment" onSubmit={(event) => { this.submitComment(event, post.id) }} >
                            <textarea id="comment" name="body" ref={(nBody) => this.nBody = nBody} onChange={(event) => this.newComment()} placeholder="Write a comment ..."></textarea>
                            <div>
                                <input type="text" name="author" ref={(nAuthor) => this.nAuthor = nAuthor} onChange={(event) => this.newComment()} placeholder="Enter Username" />
                                <button className="submit-comment" ref={(nButton) => this.nButton = nButton} disabled>Submit</button>
                            </div>
                        </form>
                    )}
                    {loaded && (showComments) && (post.commentCount > 0) && (post.comments === undefined) && <ReactLoading delay={100} type="bars" color="#663399" className="comment-loading" />}
                    {loaded && (showComments) && (post.commentCount > 0) && (post.comments) && (post.comments.length > 0) && <div className="comments-section">
                        <h5>{capitalize("comments")}</h5>

                        {postComments.filter((comment) => comments[comment].deleted === false).map((comment) => (

                            <li className="comment" key={comment}>
                                <Comment comment={comments[comment]}
                                    openEditCommentModal={this.openEditCommentModal}
                                    deletePrompt={this.deletePrompt} />
                            </li>))}
                    </div>
                    }
                </div>)}

                <Modal className="modal"
                    overlayClassName="overlay"
                    isOpen={editPostModal}
                    onRequestClose={this.closeEditPostModal}
                    contentLabel="Modal" >
                    {editPostModal &&
                        <div>
                            <button className="modal-close"
                                onClick={this.closeEditPostModal} >
                            </button>
                            <h1 className="modal-heading" > Edit {category === "all" ? "" : `${capitalize(category)} `}Post </h1>
                            <form onSubmit={(event) => this.submitPost(event, post.id)} >
                                <input type="text" ref={(title) => this.title = title} onChange={() => this.changedPost()} name="title" defaultValue={post.title} />
                                <input type="text" ref={(author) => this.author = author} onChange={() => this.changedPost()} name="author" defaultValue={post.author} />
                                <select name="category" ref={(category) => this.category = category} onChange={(event) => this.changedPost()} defaultValue={post.category}>
                                    {
                                        categories.map((thisCategory) => (<option value={thisCategory} key={thisCategory}>
                                            {capitalize.words(thisCategory)} </option>))
                                    }
                                </select>
                                <textarea name="body" ref={(body) => this.body = body} onChange={(event) => this.changedPost()} defaultValue={post.body} />
                                <button disabled ref={(button) => this.button = button}> Post </button>
                            </form>
                        </div>
                    } </Modal>

                <Modal className="modal"
                    overlayClassName="overlay"
                    isOpen={editCommentModal}
                    onRequestClose={this.closeEditCommentModal}
                    contentLabel="Modal" >
                    {editCommentModal &&
                        <div>
                            <button className="modal-close"
                                onClick={this.closeEditCommentModal} >
                            </button>
                            <h1 className="modal-heading" > Edit Comment </h1>
                            <form onSubmit={(event) => this.submitEditedComment(event)} >
                                <input type="text" name="author" ref={(cAuthor) => this.cAuthor = cAuthor} onChange={() => this.changedComment()} defaultValue={commentToEdit.author} />
                                <textarea name="body" ref={(cBody) => this.cBody = cBody} onChange={() => this.changedComment()} defaultValue={commentToEdit.body} />
                                <button disabled ref={(cButton) => this.cButton = cButton}> Submit </button>
                            </form>
                        </div>
                    } </Modal>

                <Modal className="prompt"
                    overlayClassName="overlay"
                    isOpen={openPromptModal}
                    onRequestClose={this.closePromptModal}
                    contentLabel="Modal" >
                    {
                        <div className="prompt-modal">
                            <button className="modal-close"
                                onClick={this.closePromptModal} >
                            </button>
                            <p>Are you sure you want to delete ?</p>
                            <div>
                                <button className="prompt-button" onClick={this.deleteItem} autoFocus> Yes </button>
                                <button className="prompt-button" onClick={this.closePromptModal}> No </button>
                            </div>
                        </div>
                    } </Modal>

            </div>);
    }
}


function mapStateToProps({ posts, categories }) {

    let postValue = {}, comments = {}, category = {}, categoryList = [], loaded = false;

    if (posts.posts) {
        postValue = posts.posts;
    }


    if (posts.comments) {
        comments = posts.comments;
        loaded = true;
    }


    if (categories.category) {
        category = categories.category;
    }

    if (categories.categories) {
        categoryList = categories.categories.reduce((result, category) => {
            result.push(category.name);
            return result;
        }, []);
    }

    return { posts: postValue, comments, category, categories: categoryList, loaded };
}

function mapDispatchToProps(dispatch) {
    return {
        postVote: (post, option) => {
            dispatch(fetchVotePost(post, option))
        },
        newComment: (comment) => {
            dispatch(fetchAddNewComment(comment))
        },
        editPost: (postId, post) => {
            dispatch(fetchUpdatePost(postId, post))
        },
        editComment: (commentId, comment) => {
            dispatch(fetchUpdateComment(commentId, comment))
        },
        removePost: (postId) => {
            dispatch(fetchDeletePost(postId))
        },
        removeComment: (commentId) => {
            dispatch(fetchDeleteComment(commentId))
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(PostView));