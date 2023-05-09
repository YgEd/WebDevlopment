
$( document ).ready(function() {
    console.log( 'ready!' );

    //Finds all posts the user has already commented on or liked
    $(".post-item").each(function (index){
      //console.log($(this).find(".commented").text())
      if ($(this).find(".commented").text() == "true"){
        //console.log("rendering good  " + $(this).find(".comment-body"))
        $(this).find(".comment-body").css("display", "none")
        $(this).find(".comment-button").css("display", "none")
        $(this).find(".remove-comment").css("display", "block")
      }
      if ($(this).find(".commented").text() == "false"){
        //console.log("rendering bad  " + $(this).find(".comment-body"))
        $(this).find(".comment-body").css("display", "block")
        $(this).find(".comment-button").css("display", "block")
        $(this).find(".remove-comment").css("display", "none")
      }

      if ($(this).find(".liked").text() == "true"){
        console.log("post liked")
        $(this).find(".like-button").attr("src","/public/img/filled_heart.png")
      }
      if ($(this).find(".liked").text() == "false"){
        console.log("post not liked")
        $(this).find(".like-button").attr("src","/public/img/unfilled_heart.png")
      }

  })


 



  $(".comment-button").click(function (e){
    e.preventDefault();
      var parent = $(this).parent()
      var comment_msg = parent.find(".comment-body").val()
      if (typeof(comment_msg) == "string" && comment_msg.trim().length > 0){
        //clears error msg
        parent.find(".error-comment").text("")
        let postId = parent.find(".postId").text()

        //object the ajax request will send containing the comment
        let comment_data = {
          "postId": postId,
          "msg": comment_msg,
          "add": true,
        }

        //ajax request
        $.ajax({
          type: "POST",
          url: "/feed/comment",
          data: comment_data,
          success: function (response){
            console.log(response)
            parent.find(".comment-wrapper").append(response)
            parent.find(".comment-body").css("display", "none")
            parent.find(".comment-button").css("display", "none")
            parent.find(".remove-comment").css("display", "block")
          }


        })

      }else{
        //No input is put in
        parent.find(".error-comment").text("Please input text")
      }

    
  })

  $(".remove-comment").click(function (e){
    console.log("remove button clicked!")
    e.preventDefault();
    var parent = $(this).parent()
    let postId = ""
    console.log("before = " + postId)
    postId = parent.parent().find(".postId").text()
    //sometimes the the postId is duplicated so this makes sure only one instance of the id is used as postId
    postId = postId.substring(0,24)
    console.log("after clicked remove button postId = " + postId)


      //object the ajax request will send containing the comment
      let comment_data = {
        "postId": postId,
        "remove": true
      }

      //ajax request
      $.ajax({
        type: "POST",
        url: "/feed/remove",
        data: comment_data,
        success: function (response){
          console.log(response)
          parent.find(".remove-comment").css("display", "none")

          let userId = $("#session-user").text()
          parent.find(".comment-item").each(function (index){
            if ($(this).find(".comment-userId").text() == userId){
              $(this).remove()
            }
          })
          parent.find(".comment-body").css("display", "block")
          parent.find(".comment-button").css("display", "block")
          postId = ""
        }
      })

    })



  // });

  $(".like-button").click(function (e){
    console.log("like button pressed!")
    console.log("session storage before doing like button process:")
    console.log(JSON.parse(sessionStorage.getItem("like_cache")))

    e.preventDefault();
    var parent = $(this).parent()
    let postId = ""
    postId = parent.parent().find(".postId").text()
    //sometimes the the postId is duplicated so this makes sure only one instance of the id is used as postId
    postId = postId.substring(0,24)

  
    if ($(this).attr('src') == "/public/img/unfilled_heart.png")  {


      let like_cache = JSON.parse(sessionStorage.getItem("like_cache"))
      console.log("from like " + like_cache)
      //sessionsStorage is empty
      if (like_cache == null){
          like_cache = []
          like_cache.push({"postId": postId, "liked": 1})
          sessionStorage.setItem("like_cache", JSON.stringify(like_cache))
      }else{

        if (like_cache.filter(e => e.postId == postId).length == 0){
          like_cache.push({"postId": postId, "liked": 1})
          //update sessionStorage
          sessionStorage.setItem("like_cache", JSON.stringify(like_cache))
        } else if (like_cache.filter(e => e.postId == postId).length == 1){
          like_cache.filter(e => e.postId == postId)[0].liked += 1
          //update sessionStorage
          sessionStorage.setItem("like_cache", JSON.stringify(like_cache))
        }
      }
      


      //update local like counter
      let counter = parent.find(".likes").text()
      counter = parseInt(counter) + 1


      if (counter == 1){
        //setup the html element string
        let input_text = "<p class='together likes'><strong>" + counter + "</strong> Like</p>"
        parent.find(".likes").html(input_text)
      }else{
        //setup the html element string
        let input_text = "<p class='together likes'><strong>" + counter + "</strong> Likes</p>"
        parent.find(".likes").html(input_text)
      }


      $(this).attr('src',"/public/img/filled_heart.png")
    }else{

      let like_cache = JSON.parse(sessionStorage.getItem("like_cache"))
      console.log("from unlike " + like_cache)
      if (like_cache == null){
        like_cache = []
          like_cache.push({"postId": postId, "liked": -1})
          sessionStorage.setItem("like_cache", JSON.stringify(like_cache))
      }else{

        if (like_cache.filter(e => e.postId == postId).length == 0){
          like_cache.push({"postId": postId, "liked": -1})
          //update sessionStorage
          sessionStorage.setItem("like_cache", JSON.stringify(like_cache))

        } else if (like_cache.filter(e => e.postId == postId).length == 1){
          like_cache.filter(e => e.postId == postId)[0].liked -= 1
          //update sessionStorage
          sessionStorage.setItem("like_cache", JSON.stringify(like_cache))
        }

      }
 
      $(this).attr('src',"/public/img/unfilled_heart.png")
      //update local like counter
      let counter = parent.find(".likes").text()
      counter = parseInt(counter) - 1

      if (counter == 1){
        //setup the html element string
        let input_text = "<p class='together likes'><strong>" + counter + "</strong> Like</p>"
        parent.find(".likes").html(input_text)
      }else{
        //setup the html element string
        let input_text = "<p class='together likes'><strong>" + counter + "</strong> Likes</p>"
        parent.find(".likes").html(input_text)
      }
    }


  })

  $(".remove-post").click(function (e){
    e.preventDefault()
    if (confirm("Are you sure you want to delete this post?")){
      var parent = $(this).parent()
      let postId = ""
      postId = parent.parent().find(".postId").text()
      //sometimes the the postId is duplicated so this makes sure only one instance of the id is used as postId
      postId = postId.substring(0,24)
      let post_data = {
        "postId": postId
      }
      $.ajax({
        type: "POST",
        url: "/feed/delete-post",
        data: post_data,
        success: function (response){
          if (response.success){
            alert("post deleted!")
            window.location.reload()
          }else{
            alert(response.error)
          }
      }})
  }
  
  })

  $(".share-post").click(function (e){
    e.preventDefault()
    var parent = $(this).parent()
    let postId = ""
    postId = parent.parent().find(".postId").text()
    //sometimes the the postId is duplicated so this makes sure only one instance of the id is used as postId
    postId = postId.substring(0,24)
    //make post page url
    let post_url = "http://localhost:3000/posts/" + postId

    navigator.clipboard.writeText(post_url);
    alert("post url copied to clipboard!")

  })

  //only update db for likes on page reload so no delay
  function updateDb() {
    let like_cache = JSON.parse(sessionStorage.getItem("like_cache"))
    //alert(like_cache)
    console.log("from updateDb " + like_cache)
    if (!like_cache){
      return
    }

    for (let i = 0; i < like_cache.length; i++){
      let postId = like_cache[i].postId
      let input = like_cache[i].liked
      let like_date = {
        "postId": postId
      }

      if (postId != 0 && input != 0){
        if (input == 1){
      
          $.ajax({
            type: "POST",
            url: "/feed/like",
            data: like_date,
            success: function (response){
              console.log(response)
          }})

        }
        if (input == -1){
          $.ajax({
            type: "POST",
            url: "/feed/unlike",
            data: like_date,
            success: function (response){
              console.log(response)
          }})
        }
    }                       
    }
    sessionStorage.clear()
  }

  //make sure to update db if user reloads or leaves
  // window.onload = updateDb()
  window.onbeforeunload = function(e){
    e.preventDefault();
    updateDb()

    // setTimeout(location.reload(), 500) 
    location.reload()
  }

  //update db if user clicks on a link
  $(".menu a").click(function(e) {
    // Remember the link href
    var href = this.href;

    // Don't follow the link
    e.preventDefault();
    updateDb()
    window.location = href
});






})
  
