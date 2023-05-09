$(document).ready(function(){


    $("#group-form").on("submit", function (e){
        e.preventDefault();
        var groupName = $("#groupName").val()
        var description = $("#description").val()        

        if (typeof(groupName) != "string" || groupName.trim().length == 0 || groupName.trim().length > 30){
            alert("Invalid input");
            document.getElementById("group-form").reset();

        }else{
            if (description.trim().length == 0){
                $("#description").val("") 
            document.getElementById("group-form").submit()
            return document.getElementById("group-form").reset();
            }else{
                if (description.trim().length > 100){
                    alert("Invalid input");
                    document.getElementById("group-form").reset();
                }else{
                    document.getElementById("group-form").submit()
                    return document.getElementById("group-form").reset();
                }
            }
        }
    })

    $("#group-form-create").on("submit", function (e){
        e.preventDefault();
        var groupName = $("#groupName").val()
        var description = $("#description").val()
        if (description.trim().length == 0){
            description = ""
        }        

        if (typeof(groupName) != "string" || groupName.trim().length == 0 || groupName.trim().length > 30){
            alert("Invalid input");
            document.getElementById("group-form").reset();

        }else{
           
            //send ajax request to create group
            let data = {
                "groupName": groupName,
                "description": description,
                "create": true,
            }

            $.ajax({
                type: "POST",
                url: "/groups",
                data: data,
                success: function (response){
                    if (response.response == true){
                        alert("group created succesfully")
                        window.location.href = "/groups"
                    }else{
                        alert(response.message)
                        window.location.reload()
                    }

                }
            })
        }
    })



   $(".remove-button").click(function (e){
        e.preventDefault();
        var groupId = $("#group-id").text()
        var parent = $(this).parent()
        var username = parent.find(".mem-user").text()

        let data = {
            "groupId": groupId,
            "userName": username,
            "remove": true,
        }

        console.log(data)
        //ajax request to remove the member
        $.ajax({
            type: "POST",
            url: "/groups/remove_member",
            data: data,
            success: function (response){
                if (response.response == true){
                    alert("member removed succesfully")
                    window.location.reload()
                }else{
                    alert("member removed unsuccesfully")
                    window.location.reload()
                }
            }


        })


   })

   $("#remove-group-button").click(function (e){

        e.preventDefault();

        if (confirm("Are you sure you want to remove this group?") == true){
            var groupId = $("#group-id").text()

            let data = {
                "groupId": groupId,
                "remove": true,
            }

            console.log(data)
            //ajax request to remove the member
            $.ajax({
                type: "POST",
                url: "/groups/delete_group",
                data: data,
                success: function (response){
                    if (response.response == true){
                        alert("group removed succesfully")
                        window.location.href = "/groups"
                    }else{
                        alert("group removed unsuccesfully")
                        window.location.reload()
                    }
                }


            })
        }else{
            window.location.reload()
        }
    })


    $(".leave-group-button").click(function (e){
        e.preventDefault();

        var parent = $(this).parent()
        var groupname = parent.find(".group-name").text()
        console.log("from leave button" + groupname)

        let data = {
            "groupname": groupname,
            "leave": true,
        }

        //ajax request to remove the member
        $.ajax({
            type: "POST",
            url: "/search/leave",
            data: data,
            success: function (response){
                if (response.response == "success"){
                    alert("group left succesfully")
                    window.location.href = "/groups"
                }else{
                    alert("group left unsuccesfully")
                    window.location.reload()
                }
            }
        })


    })


})