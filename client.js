//Runs when the user registers
function submit(req, res, next){
    let user = {
        username: document.getElementById("username").value,
        password: document.getElementById("password").value
    }

    //Finding the user with the give username
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function(){

		if (this.readyState == 4 && this.status == 200){
            let user2 = JSON.parse(this.response);

            //Adds the user if it does not exist
            if (user2 == null){
                xhttp.open("POST", "/register", true);
	            xhttp.setRequestHeader("Content-Type", "application/json");
	            xhttp.send(JSON.stringify(user));
	            xhttp.onreadystatechange = function(){
            		if (this.readyState == 4 && this.status == 200){
                        let user = JSON.parse(this.response);

                        //Redirect to the user's page
                        window.location = "/users/"+user._id;
                    }
                }
                xhttp.open("GET", "/userId/"+user.username);
                xhttp.setRequestHeader("Accept", "application/json");
	            xhttp.send();
            }
            else{
                alert("User with username "+user.username+ " already exists");
            }

        }
    }
    xhttp.open("GET", "/userId/"+user.username);
    xhttp.setRequestHeader("Accept", "application/json");
	xhttp.send()
}

//Runs when the user logs in
function login(){
    let user = {
        username: document.getElementById("username").value,
        password: document.getElementById("password").value
    }

    //Finding the user with the given username
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function(){

		if (this.readyState == 4 && this.status == 200){
            let user2 = JSON.parse(this.response);

            //User is not found
            if (user2 == null){
                alert("Error: User does not exist")
            }
            else{

                //Copying the mongo id to the session data
                user.id = user2._id;

                //If the user has correct credentials
                if (user.username == user2.username && user.password == user2.password){
                    alert("Login Successful")
                    xhttp.open("POST", "/login", true);
	                xhttp.setRequestHeader("Content-Type", "application/json");
	                xhttp.send(JSON.stringify(user));

                    //Sends the user to the home page
                    window.location = "/"
                }
                else{
                    alert("Error: Invalid credentials");
                }
            }
            
        }
    }

    
    xhttp.open("GET", "/userId/"+user.username);
    xhttp.setRequestHeader("Accept", "application/json");
	xhttp.send();
}

//Updating the logged in user's privacy
function save(){
    alert("Privacy options saved")
    let user = {
        username: document.getElementById("username").innerText,
        checked: document.getElementById("privacy").checked
    }
    
    //Finding the user with the user's name
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function(){
		if (this.readyState == 4 && this.status == 200){
            let user2 = JSON.parse(this.response);
            console.log(user2)
            //Sending the user to the server
            xhttp.open("POST", "/savePrivacy", true);
	        xhttp.setRequestHeader("Content-Type", "application/json");
	        xhttp.send(JSON.stringify(user));
            window.location = "/users/"+user2._id;
        }
    }
    xhttp.open("GET", "/userId/"+user.username);
    xhttp.setRequestHeader("Accept", "application/json");
	xhttp.send();
    
}