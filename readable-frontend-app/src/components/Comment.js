import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { fetchVoteComment } from '../actions';
import * as PostUtils from '../utils/PostUtils';
import '../css/Comment.css';

class Comment extends Component {

    // Defines a single comment

    static propTypes = {
        comment: PropTypes.object.isRequired,
        openEditCommentModal: PropTypes.func.isRequired
    };

    /**
     * @description This method updates the votes
     * @param {string} commentId
     * @param {string} option - Upvote or Downvote
     **/
    voteComment = (commentId, option) => {
        this.props.commentVote(commentId, option);
    };

    render() {

        const { comment, openEditCommentModal, deletePrompt } = this.props;
        return (

            <div>
                <div className="fine-comment-details">
                    <p> {`@${comment.author}`} </p>
                    <p> {PostUtils.getDate(comment.timestamp)} </p>
                </div>
                <div className="comment-body" >
                    <p > {comment.body} </p>
                </div>
                <div className="comment-counts" >
                    <div className="votes">
                        <div className="upvote" onClick={() => { this.voteComment(comment.id, "upVote") }} ></div>
                        <p className="vote-value">{comment.voteScore} </p>
                        <div className="downvote" onClick={() => { this.voteComment(comment.id, "downVote") }}></div>
                    </div>
                    <div className="edit-item" onClick={() => openEditCommentModal(comment)}></div>
                    <div className="delete-item" onClick={() => deletePrompt("comment", comment.id)}></div>
                </div>
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return {

        commentVote: (comment, option) => {
            dispatch(fetchVoteComment(comment, option))
        }
    };
}

export default connect(null, mapDispatchToProps)(Comment);