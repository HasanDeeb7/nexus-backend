import Comment from "../models/commentModel.js";
import Post from "../models/postModel.js";
import User from "../models/userModel.js";

export async function createPost(req, res) {
  const { caption, game, type, isSpoiler } = req.body;
  const image = req.file?.filename;
  console.log(req.file);
  console.log(req.body.image);
  if (!caption || !game || !type) return res.status(400).send("Missing fields");
  try {
    const post = await Post.create({
      caption: caption,
      game: game._id,
      type: type,
      image: image || "",
      user: req.user.id,
      isSpoiler: isSpoiler,
    });
    if (post) {
      await User.findOneAndUpdate(
        { _id: req.user.id },
        { $push: { posts: post._id } }
      );
      res.json(post);
    } else {
      res.status(400).json({ error: "Error creating post" });
    }
  } catch (error) {
    console.log(error);
  }
}
export async function getPosts(req, res) {
  const userId = req.user.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      console.log("User not found");
    } else {
      const posts = await Post.find()
        .populate(["game", "user"])
        .sort({ createdAt: -1 })
        .skip(req.offset)
        .limit(req.limit)
        .exec();
      if (posts) {
        const comments = posts.map((item) => item.comments);
        comments.reverse();
        posts.comments = comments;
        res.json(posts);
      }
    }
  } catch (error) {
    console.log(error);
  }
}
export async function getPostsByUser(req, res) {
  const { userId } = req.query;
  try {
    const posts = await Post.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(req.offset)
      .limit(req.limit)
      .populate(["comments", "game", "user"])
      .exec();
    if (posts) {
      res.json(posts);
    } else {
      res.json(400).json({ error: "Error getting posts" });
    }
  } catch (error) {
    console.log(error);
  }
}
export async function getPostsFyp(req, res) {
  const userId = req.user.id;
  console.log("first");
  try {
    const user = await User.findById(userId)
      .populate(["games", "friends"])
      .exec();
    if (!user) {
      console.log("User not found");
    } else {
      const posts = await Post.find({
        $or: [{ user: { $in: user.friends } }, { game: { $in: user.games } }],
      })
        .sort({ createdAt: -1 })
        .populate(["game", "user"])
        .skip(req.offset)
        .limit(req.limit)
        .exec();
      if (posts) {
        res.json(posts);
      } else {
        res.status(404).json({ error: "No data found" });
      }
    }
  } catch (error) {
    console.log(error);
  }
}
export async function getPostsByType(req, res) {
  const { type, game } = req.query;
  const query = { type: type };
  if (game) {
    query.game = game;
  }
  try {
    const posts = await Post.find(query);
    if (posts && posts.length > 0) {
      res.json(posts);
    } else {
      res.status(404).json({ error: `No ${type} posts found` });
    }
  } catch (error) {
    console.log(error);
  }
}
export async function deletePost(req, res) {
  const { id } = req.query;
  try {
    const post = await Post.findOne({ _id: id });
    if (post && post.user == req.user.id) {
      await post.deleteOne();
      res.json({ message: "Post deleted successfully" });
    } else {
      res.status(400).json({ error: "Error deleting post" });
    }
  } catch (error) {
    console.log(error);
  }
}
export async function addComment(req, res) {
  const { postId, content } = req.body;
  try {
    if (postId) {
      const post = await Post.findById(postId);

      if (post) {
        const comment = await Comment.create({
          post: post._id,
          content: content,
          user: req.user.id,
        });

        if (comment) {
          const comments = await Comment.findById(comment._id)
            .populate("user")
            .sort({ createdAt: -1 })
            .exec();
          return res.json(comments);
        } else {
          return res.status(400).json({ error: "Error creating comment" });
        }
      } else {
        return res.status(400).json({ error: "Error getting post data" });
      }
    }
  } catch (error) {
    console.log(error);
  }
}
export async function getOnePost(req, res) {
  const { postId } = req.query;
  try {
    if (postId) {
      const post = await Post.findById(postId)
        .populate([
          "comments",
          "game",
          "user",
          { path: "comments", populate: "user" },
        ])
        .exec();
      if (post) {
        return res.json(post);
      } else {
        return res.status(404).json({ error: "Post not found" });
      }
    } else {
      return res.status(404).json({ error: "No id provided" });
    }
  } catch (error) {
    console.log(error);
  }
}
export async function addReaction(req, res) {
  const { postId, reaction } = req.body;
  try {
    // const user = await User.findById(req.user.id);

    const updatedReaction = { type: reaction, user: req.user.id };
    if (postId) {
      const post = await Post.findById(postId);
      if (post) {
        await post
          .updateOne({ $push: { reactions: updatedReaction } })
          .sort({ data: -1 })
          .exec();
        return res.json(post);
      } else {
        return res.status(404).json({ error: "Error getting post data" });
      }
    } else {
      return res.status(500).json({ error: "No id provided" });
    }
  } catch (error) {
    console.log(error);
  }
}

export async function removeReaction(req, res) {
  const { postId } = req.body;
  try {
    // const user = await User.findById(req.user.id);
    // if (user) {
    if (postId) {
      const post = await Post.findByIdAndUpdate(postId, {
        $pull: { reactions: { user: req.user.id } },
      });
      if (post) {
        return res.json({ post: post });
      } else {
        return res.status(404).json({ error: "Error getting post data" });
      }
    } else {
      return res.status(500).json({ error: "No id provided" });
    }
    // }
  } catch (error) {
    console.log(error);
  }
}
export async function likeComment(req, res) {
  const { action, commentId } = req.body;
  try {
    if (action === "like") {
      const comment = await Comment.findByIdAndUpdate(
        commentId,
        { $push: { likes: req.user.id } },
        { new: true }
      ).populate("user");
      const allComments = await Comment.find({ post: comment.post })
        .sort({ createdAt: -1 })
        .populate("user");
      if (allComments) {
        res.json(allComments);
      } else {
        res.status(404).json({ error: "Error getting comments" });
      }
    } else if (action === "dislike") {
      const comment = await Comment.findByIdAndUpdate(
        commentId,
        { $pull: { likes: req.user.id } },
        { new: true }
      ).populate("user");
      const allComments = await Comment.find({ post: comment.post })
        .sort({ createdAt: -1 })
        .populate("user");
      if (allComments) {
        res.json(allComments);
      } else {
        res.status(404).json({ error: "Error getting comments" });
      }
    }
  } catch (error) {
    console.log(error);
  }
}
export async function deleteComment(req, res) {
  try {
    const { commentId, postId } = req.query;
    const deletedComment = await Comment.findByIdAndDelete(commentId);
    if (deletedComment) {
      console.log("deletedComment");
      await Post.findByIdAndUpdate(postId, {
        $pull: { comments: commentId },
      });

      const allComments = await Comment.find({ post: postId })
        .sort({ createdAt: -1 })
        .populate("user");
      if (allComments) {
        res.json(allComments);
      } else {
        res.status(404).json({ error: "Error getting comments" });
      }
    } else {
      res.status(404).send("Error deleting comment");
    }
  } catch (error) {
    console.log(error);
  }
}
export async function getComments(req, res) {
  const { postId } = req.query;
  console.log(postId);
  try {
    const comments = await Comment.find({ post: postId })
      .sort({
        createdAt: -1,
      })
      .populate(["user"]);
    if (comments) {
      console.log(comments);
      res.json(comments);
    }
  } catch (error) {
    console.log(error);
  }
}
