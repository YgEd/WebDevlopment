$(document).ready(function(){

    $("#follow-form").on("submit", function (e){

        e.preventDefault();

        var username = $("#username").val()

        if (typeof(username) != "string" || username.trim().length == 0){
            alert("Invalid input");
            document.getElementById("follow-form").reset();
        }

        else{

            //send ajax request to follow user
            let data = {
                "username": username,
                "follow": true,
            }

            $.ajax({
                type: "POST",
                url: "/search/follow",
                data: data,
                success: function (response){
                    if (response.response == "success"){
                        alert("user followed succesfully")
                        location.reload()
                    }else{
                        alert(response.response)
                        location.reload()
                    }
                }
            })
        }


    })

    $("#unfollow-form").on("submit", function (e){
            
            e.preventDefault();
    
            var username = $("#username").val()
    
            if (typeof(username) != "string" || username.trim().length == 0){
                alert("Invalid input");
                document.getElementById("unfollow-form").reset();
            }
    
            else{
    
                //send ajax request to follow user
                let data = {
                    "username": username,
                    "unfollow": true,
                }
    
                $.ajax({
                    type: "POST",
                    url: "/search/unfollow",
                    data: data,
                    success: function (response){
                        if (response.response == "success"){
                            alert("user unfollowed succesfully")
                            location.reload()
                        }else{
                            alert(response.response)
                            location.reload()
                        }
                    }
                })
            }
 
    })
    $("#remove-user-button").click(function (e){

        e.preventDefault();

        let data = {
            "remove": true,
        }

        console.log(data)
        //ajax request to remove the member
        $.ajax({
            type: "POST",
            url: "/profile/delete",
            data: data,
            success: function (response){
                if (response.response == true){
                    alert("user removed succesfully")
                    window.location.href = "/logout"
                }else{
                    alert("user removed unsuccesfully")
                    window.location.reload()
                }
            }


        })
    })

})