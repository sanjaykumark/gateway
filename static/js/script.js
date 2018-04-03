$(document).ready(function() {
    //Tab Switching

    $(".tab").on("click","li",function(){
       var x= $(this).text();
       x = x.toLowerCase();
       if(x=="login")
        y="register";
       else
         y="login";
         document.getElementById(x+"-tab").classList.add("active-tab");
         document.getElementById(y+"-tab").classList.remove("active-tab");
         document.getElementById(y+"-contents").classList.add("hidden");
         document.getElementById(x+"-contents").classList.remove("hidden"); 
    });

    var delay = (function(){
        var timer = 0;
        return function(callback, ms){
          clearTimeout (timer);
          timer = setTimeout(callback, ms);
        };
      })();
      
    
     function chkPassword(name,pass){
         delay(function(){
            $.ajax({
                method:"GET",
                url : "/checkpassword/"+name+"/"+pass,
                success: function(data){
                    if(data.exists==false)
                        $("#nowpass-err").text("Wrong Password");
                    else
                    $('#nowpass-err').text("");    
               }
            });
         },1000);
     }; 

    function chkName(uname) {
        
        delay(function(){
            $.ajax({
                method: "GET",
                url: "/checkusername/"+uname,
                success: function(data) {
                  console.log(data.exists);
                    if(data.exists==true)
                    $('#uname-err').text("Username already exists")
                }
                
            });
        }, 500);
    }
    function chkMail(mail) {
        
        delay(function(){
            $.ajax({
                method: "GET",
                url: "/checkemail/"+mail,
                success: function(data) {
                  if(data.exists==true)
                  $('#email-err').text("Email Id already exists")
                }
                
            });
        }, 1000);
    }
    //Form Validations
    $('#reg_name').on('keyup paste',function(){
        var name=$(this).val();
        var letters = /^[A-Za-z]+$/;
        if(!(letters.test(name)&&(name.length>4)))
        $('#name-err').text("Invalid or short name");
        else
        $('#name-err').text("");
    });
    $('#reg_uname').on('keyup paste',function(){
        var uname=$(this).val();
        if(uname.length<5)
        $('#uname-err').text("Username too short");
        else
        $('#uname-err').text("");
        chkName(uname);    
    });
    $('#now_pass').on('keyup paste',function(){
        var usr=$("#username").text();
        var pass=$(this).val();
        chkPassword(usr,pass);    
    });

    $('#chg_pass').on('keyup paste',function(){
        if($(this).val().length<8)
        {   //console.log($(this).val().length);
            $('#newpass-err').text("Password must have minimum 8 characters");
            //alert("kammi daww");
        }   
        else
        $('#newpass-err').text("");
        if($(this).val()==$('#now_pass').val())
            { $('#newpass-err').text("Password is same as old ");  }
        else
        $('#newpass-err').text("");    
    }); 
    
    $('#chg_conpass').on('keyup paste',function(){
        if($(this).val()!=$('#chg_pass').val())
        $('#newconpass-err').text("Passwords don't match");
        else
        $('#newconpass-err').text("");
    });

    $('#reg_pass').on('keyup paste',function(){
        if($(this).val().length<8)
        $('#pass-err').text("Password must have minimum 8 characters");
        else
        $('#pass-err').text("");
    });
    $('#reg_conpass').on('keyup paste',function(){
        if($(this).val()!=$('#reg_pass').val())
        $('#conpass-err').text("Passwords don't match");
        else
        $('#conpass-err').text("");
    });
    $('#reg_email').on('keyup paste',function(){ 
        var email=$(this).val();
        if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)))
            $('#email-err').text("Invalid email");
        else    
        $('#email-err').text("");
        chkMail(email); 
    });

    

 $('#changePass').on('click',function(){
     $('#modalBox').css("display","block"); 
 });   

 $('.close').on('click',function(){
     $('#modalBox').css("display","none");
 });   


 
});
var modal = document.getElementById('modalBox');
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
