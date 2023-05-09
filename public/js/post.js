$(document).ready(function(){

    $("#like-button").on("click", function (e){

        let data = {
            "postId": $("#postId").text(),
            "userId": $("#currUser").text(),
            "url": window.location.href
        }

        let hasliked = $("#liked").text()
        if (hasliked == "true"){

            $.ajax({
                type: "POST",
                url: "/feed/unlike",
                data: data,
                success: function (response){
                    window.location.reload()
                }
            })
        }else{
            $.ajax({
                type: "POST",
                url: "/feed/like",
                data: data,
                success: function (response){
                    window.location.reload()
                }
            })
    }
    })

    $("#comment-form").submit(function (e){
        e.preventDefault();

        let comment_body = $(".comment-body").val()
        if (typeof comment_body != "string" || comment_body.trim().length == 0 || comment_body.trim().length > 100){
            alert("Invalid input")
            document.getElementById("comment-form").reset();
        }

        comment_body = comment_body.trim()

        let data = {
            "postId": $("#postId").text(),
            "userId": $("#currUser").text(),
            "msg": comment_body,
            "url": window.location.href
        }

        $.ajax({
            type: "POST",
            url: "/feed/comment",
            data: data,
            success: function (response){
                window.location.reload()
            }
        })


    })

    $(".remove-comment").click(function (e){
        e.preventDefault();

        let data = {
            "postId": $("#postId").text(),
            "userId": $("#currUser").text(),
            "url": window.location.href
        }

        $.ajax({
            type: "POST",
            url: "/feed/remove",
            data: data,
            success: function (response){
                window.location.reload()
            }
        })
    })

    $(".delete-post-button").click(function (e){
        e.preventDefault();

        //ensure user wants to delete post
        if (confirm("Are you sure you want to delete this post?")){
            //ensure us er is the owner of the post
            var currUser = $("#currUser").text()
            var postOwner = $("#ownerId").text()

            if(currUser != postOwner){
                return alert("You are not the owner of this post")
            }

            let data = {
                "postId": $("#postId").text(),
                "userId": $("#currUser").text(),
                "url": "/feed"
            }

            $.ajax({
                type: "POST",
                url: "/feed/delete-post",
                data: data,
                success: function (response){
                    window.location.reload()
                }
            })
    }

    })



})