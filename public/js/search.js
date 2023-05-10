

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
                let list = response.response
                if (response.response == null || response.response.length === 0){
                    $("#search_result").html("<p class='search-res center search-res-title'>No results found</p>")
                } else {
                    $("#search_result").append("<p class='search-res center search-res-title'>Result</p>")
                    if (response.type == "user"){
                        list.map((element) => {
                            {$("#search_result").append(`<a class='center search-res search-name block' href="/profile/${element._id}">Go to profile</a>` + "<p class='center'>" + element.username + "</p>");
                            if (response.auth){
                                //add follow button
                                if (response.type == "user"){
                                    
                                     if (response.following.includes(element._id.toString()) == true){
                                        $("#search_result").append("<button class='search-res center unfollow-button' data-username='" + element.username + "' type='submit'>Unfollow</button>")

                                    } else {
                                        $("#search_result").append("<button class='search-res center follow-button' data-username='" + element.username + "' type='submit'>Follow</button>")

                                    }
                                }
                            }
                    }})
                    } else{
                        list.map((element) =>{
                            $("#search_result").append(`<a class='center search-res search-name block' href="/groups/${element._id}">Go to group </a>` + "<p class ='center'>" + element.groupName + "</p>")
                            //add join button
                            if (response.type == "group"){
                            if (response.groupOwner.includes(element._id)){
                                    $("#search_result").append("<button class='search-res center leave-button' data-groupname='" + element.groupName+ "' type='submit'>Leave</button>")
                                } else {
                                    $("#search_result").append("<button class='search-res center join-button' data-groupname='" + element.groupName+ "'  type='submit'>Join</button>")
                                }
                            }
                        })
                        }
                    }
                    
                    
                        
                        
                    }
                }

            )

    })

    $(document).on('click', '.join-button', function (e) {
        e.preventDefault();
        console.log("join button clicked");

        let postdata = {
            "groupname": $(this).data("groupname")
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
            "groupname": $(this).data("groupname")
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
            "username": $(this).data("username")
        }
    
        $.ajax({
            type: "POST",
            url: "/search/follow",
            data: postdata,
            success: function (response){
                if (response.response == "success"){
                    alert("Successfully followed user")
                    window.location.href = "/search";
                    
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
            "username": $(this).data("username")
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