//HTTP request Get,post,put,delete

// ============ POSTS FUNCTIONS ============

async function Load() {
  try {
    let res = await fetch("http://localhost:3000/posts");
    let data = await res.json();
    let body = document.getElementById("table-body");
    let showDeleted = document.getElementById("showDeleted")?.checked || false;

    body.innerHTML = "";

    for (const post of data) {
      // Hiển thị tất cả posts nếu showDeleted = true, ngược lại chỉ hiển thị posts chưa xóa
      if (showDeleted || !post.isDeleted) {
        let rowClass = post.isDeleted ? "deleted" : "";
        body.innerHTML += `
          <tr class="${rowClass}">
            <td>${post.id}</td>
            <td>${post.title}</td>
            <td>${post.views}</td>
            <td>
              <input value="Edit" type="submit" onclick="EditPost('${post.id}')" />
              ${
                post.isDeleted
                  ? `<input value="Restore" type="submit" onclick="RestorePost('${post.id}')" />`
                  : `<input value="Delete" type="submit" onclick="Delete('${post.id}')" />`
              }
            </td>
          </tr>`;
      }
    }
  } catch (error) {
    console.error("Error loading posts:", error);
  }
}

async function Save() {
  let id = document.getElementById("id_txt").value.trim();
  let title = document.getElementById("title_txt").value;
  let views = parseInt(document.getElementById("views_txt").value) || 0;

  if (!title) {
    alert("Vui lòng nhập title!");
    return;
  }

  let res;

  if (id) {
    // Update existing post
    let getPost = await fetch("http://localhost:3000/posts/" + id);
    if (getPost.ok) {
      let existingPost = await getPost.json();
      res = await fetch("http://localhost:3000/posts/" + id, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...existingPost,
          title: title,
          views: views,
        }),
      });
    }
  } else {
    // Create new post with auto-increment ID
    let allPosts = await fetch("http://localhost:3000/posts");
    let posts = await allPosts.json();

    // Tìm maxId
    let maxId = 0;
    for (const post of posts) {
      let postId = parseInt(post.id);
      if (postId > maxId) {
        maxId = postId;
      }
    }

    let newId = (maxId + 1).toString();

    res = await fetch("http://localhost:3000/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: newId,
        title: title,
        views: views,
        isDeleted: false,
      }),
    });
  }

  if (res.ok) {
    console.log("Lưu thành công");
    ClearPostForm();
    Load();
  }
}

async function Delete(id) {
  if (!confirm("Bạn có chắc muốn xóa post này?")) return;

  // Soft delete - cập nhật isDeleted = true
  let getPost = await fetch("http://localhost:3000/posts/" + id);
  if (getPost.ok) {
    let post = await getPost.json();
    let res = await fetch("http://localhost:3000/posts/" + id, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...post,
        isDeleted: true,
      }),
    });

    if (res.ok) {
      console.log("Xóa mềm thành công");
      Load();
    }
  }
}

async function RestorePost(id) {
  let getPost = await fetch("http://localhost:3000/posts/" + id);
  if (getPost.ok) {
    let post = await getPost.json();
    let res = await fetch("http://localhost:3000/posts/" + id, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...post,
        isDeleted: false,
      }),
    });

    if (res.ok) {
      console.log("Khôi phục thành công");
      Load();
    }
  }
}

async function EditPost(id) {
  let res = await fetch("http://localhost:3000/posts/" + id);
  if (res.ok) {
    let post = await res.json();
    document.getElementById("id_txt").value = post.id;
    document.getElementById("title_txt").value = post.title;
    document.getElementById("views_txt").value = post.views;
  }
}

function ClearPostForm() {
  document.getElementById("id_txt").value = "";
  document.getElementById("title_txt").value = "";
  document.getElementById("views_txt").value = "";
}

// ============ COMMENTS FUNCTIONS ============

async function LoadComments() {
  try {
    let res = await fetch("http://localhost:3000/comments");
    let data = await res.json();
    let body = document.getElementById("comments-body");

    body.innerHTML = "";

    for (const comment of data) {
      body.innerHTML += `
        <tr>
          <td>${comment.id}</td>
          <td>${comment.text}</td>
          <td>${comment.postId}</td>
          <td>
            <input value="Edit" type="submit" onclick="EditComment('${comment.id}')" />
            <input value="Delete" type="submit" onclick="DeleteComment('${comment.id}')" />
          </td>
        </tr>`;
    }
  } catch (error) {
    console.error("Error loading comments:", error);
  }
}

async function SaveComment() {
  let id = document.getElementById("comment_id_txt").value.trim();
  let text = document.getElementById("comment_text_txt").value;
  let postId = document.getElementById("comment_postId_txt").value;

  if (!text || !postId) {
    alert("Vui lòng nhập đầy đủ thông tin!");
    return;
  }

  let res;

  if (id) {
    // Update existing comment
    res = await fetch("http://localhost:3000/comments/" + id, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id,
        text: text,
        postId: postId,
      }),
    });
  } else {
    // Create new comment with auto-increment ID
    let allComments = await fetch("http://localhost:3000/comments");
    let comments = await allComments.json();

    // Tìm maxId
    let maxId = 0;
    for (const comment of comments) {
      let commentId = parseInt(comment.id);
      if (commentId > maxId) {
        maxId = commentId;
      }
    }

    let newId = (maxId + 1).toString();

    res = await fetch("http://localhost:3000/comments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: newId,
        text: text,
        postId: postId,
      }),
    });
  }

  if (res.ok) {
    console.log("Lưu comment thành công");
    ClearCommentForm();
    LoadComments();
  }
}

async function EditComment(id) {
  let res = await fetch("http://localhost:3000/comments/" + id);
  if (res.ok) {
    let comment = await res.json();
    document.getElementById("comment_id_txt").value = comment.id;
    document.getElementById("comment_text_txt").value = comment.text;
    document.getElementById("comment_postId_txt").value = comment.postId;
  }
}

async function DeleteComment(id) {
  if (!confirm("Bạn có chắc muốn xóa comment này?")) return;

  let res = await fetch("http://localhost:3000/comments/" + id, {
    method: "DELETE",
  });

  if (res.ok) {
    console.log("Xóa comment thành công");
    LoadComments();
  }
}

function ClearCommentForm() {
  document.getElementById("comment_id_txt").value = "";
  document.getElementById("comment_text_txt").value = "";
  document.getElementById("comment_postId_txt").value = "";
}

// Load initial data
Load();
LoadComments();