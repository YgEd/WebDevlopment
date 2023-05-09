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

})