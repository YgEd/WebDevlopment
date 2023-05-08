

$( document ).ready(function() {
    console.log( 'ready!' );
    $("#search_button").click(function(e){
        e.preventDefault();
        console.log("search button clicked")
        let searchType = $("#searchType").val()
        let searchInput = $("#searchInput").val()

        //clear previous search results
        if ($(".search-res").length > 0){
            $(".search-res").remove()
        }

        if (typeof searchType != "string" || (searchType != "user" && searchType != "group")){
            alert("Invalid search type")
            $("#searchType").val("") 
            return
        }

        if (typeof searchInput != "string" ||  searchInput.trim().length == 0 || searchInput.trim().length > 30){
            alert("Invalid search length")
            $("#searchInput").val("")
            return
        }

            let search_data = {
            "searchType": searchType.trim(),
            "searchInput": searchInput.trim(),
        }

        $.ajax({
            type: "POST",
            url: "/search",
            data: search_data,
            success: function (response){
                console.log(response)
                if (response.response == null){
                    $("#search_result").html("<p class='search-res center search-res-title'>No results found</p>")
                } else {
                    $("#search_result").append("<p class='search-res center search-res-title'>Result</p>")
                    $("#search_result").append(`<a class='center search-res search-name block' href="/profile/${response.userobj._id}"` + "<p>" + response.response + "</p></a>")
                    
                    //if user is authenticated
                    if (response.auth){
                        //add follow button
                        if (response.type == "user"){
                            if (response.following == true){
                                $("#search_result").append("<button class='search-res center unfollow-button' type='submit'>Unfollow</button>")
                            } else {
                                $("#search_result").append("<button class='search-res center follow-button' type='submit'>Follow</button>")
                            }
                        }
                        
                        //add join button
                        if (response.type == "group"){
                            if (!response.groupOwner){
                                if (response.inGroup == true){
                                    $("#search_result").append("<button class='search-res center leave-button' type='submit'>Leave</button>")
                                } else {
                                    $("#search_result").append("<button class='search-res center join-button' type='submit'>Join</button>")
                                }
                            }
                        }
                    }
                }

            }})

    })

    $(document).on('click', '.join-button', function (e) {
        e.preventDefault();
        console.log("join button clicked");

        let postdata = {
            "groupname": $(".search-name").text()
        }

        $.ajax({
            type: "POST",
            url: "/search/join",
            data: postdata,
            success: function (response){
                if (response.response == "success"){
                    alert("Successfully joined group")
                    window.location.reload()
                } else {
                    alert("Failed to join group")
                    window.location.reload()
                }
            }


        })

    })

    $(document).on('click', '.leave-button', function (e) {
        e.preventDefault();
        console.log("leave button clicked");

        let postdata = {
            "groupname": $(".search-name").text()
        }

        $.ajax({
            type: "POST",
            url: "/search/leave",
            data: postdata,
            success: function (response){
                if (response.response == "success"){
                    alert("Successfully left group")
                    window.location.reload()
                } else {
                    alert("Failed to leave group")
                    window.location.reload()
                }
            }


        })

    })

    $(document).on('click', '.follow-button', function (e) {
        e.preventDefault();
        console.log("follow button clicked");

        let postdata = {
            "username": $(".search-name").text()
        }

        $.ajax({
            type: "POST",
            url: "/search/follow",
            data: postdata,
            success: function (response){
                if (response.response == "success"){
                    alert("Successfully followed user")
                    window.location.reload()
                    
                } else {
                    alert("Failed to follow user")
                    window.location.reload()
                }
            }


        })
        
    })


    $(document).on('click', '.unfollow-button', function (e) {
        e.preventDefault();
        console.log("unfollow button clicked");

        let postdata = {
            "username": $(".search-name").text()
        }

        $.ajax({
            type: "POST",
            url: "/search/unfollow",
            data: postdata,
            success: function (response){
                if (response.response == "success"){
                    alert("Successfully unfollowed user")
                    window.location.reload()
                } else {
                    alert("Failed to unfollow user")
                    window.location.reload()
                }
            }


        })

    })





});