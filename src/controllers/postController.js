import Comment from "../models/commentModel.js";
import Post from "../models/postModel.js";
import User from "../models/userModel.js";

export async function createPost(req, res) {
  const { caption, game, type, isSpoiler } = req.body;
  const image = req.file?.filename;
  //   const user = await User.findById(req.user.id);
  try {
    const post = await Post.create({
      caption: caption,
      game: game,
      type: type,
      image: image,
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
    const user = await User.findById(userId).populate("games").exec();
    if (!user) {
      console.log("User not found");
    } else {
      const posts = await Post.find({ game: { $in: user.games } }).exec();
      if (posts) {
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
      .skip(req.offset)
      .limit(req.limit)
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
  try {
    const user = await User.findById(userId)
      .populate(["games", "friends"])
      .exec();
    if (!user) {
      console.log("User not found");
    } else {
      const posts = await Post.find({ user: { $in: user.friends } }).exec();
      if (posts) {
        res.json(posts);
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
          post: post,
          content: content,
          user: req.user.id,
        });
        if (comment) {
          await post.updateOne({ $push: { comments: comment._id } }).exec();
          return res.json(comment);
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
      const post = await Post.findById(postId).populate(["comments", "game"]);
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
    const user = await User.findById(req.user.id);
    if (user) {
      const updatedReaction = { type: reaction, user: user };
      if (postId) {
        const post = await Post.findById(postId);
        if (post) {
          await post
            .updateOne({ $push: { reactions: updatedReaction } })
            .exec();
          return res.json(post);
        } else {
          return res.status(404).json({ error: "Error getting post data" });
        }
      } else {
        return res.status(500).json({ error: "No id provided" });
      }
    }
  } catch (error) {
    console.log(error);
  }
}

export async function removeReaction(req, res) {
  const { postId } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      if (postId) {
        const post = await Post.findByIdAndUpdate(postId, {
          $pull: { reactions: { "user._id": user._id } },
        });
        if (post) {
          return res.json({ post: post, userId: user._id });
        } else {
          return res.status(404).json({ error: "Error getting post data" });
        }
      } else {
        return res.status(500).json({ error: "No id provided" });
      }
    }
  } catch (error) {
    console.log(error);
  }
}
