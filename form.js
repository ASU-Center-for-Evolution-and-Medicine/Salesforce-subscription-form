//global variables
var resBox = document.getElementById('form-response');

//main form submission form
function submitForm() {
  showLoading();
  resBox.innerHTML = "";

  var formData = convertFormData();
  if (!validateForm(formData)) {
    restoreSubmit();
    missingFields();
  } else {
    var json = JSON.stringify(formData);
    sendData(json);
  }
}

//makes sure all of the values exist in the form
function validateForm(form) {
  return (form.fName !== "" && form.lName !== "" && form.email !== "" && (form.weekly || form.monthly || form.journal));
}

//alerts user
function missingFields() {
  resBox.innerHTML = '<div class="alert alert-block alert-danger"><a class="close" href="#" data-dismiss="alert">x</a><p></p> <h2 class="element-invisible">Status message</h2><p><strong>Missing Fields!</strong> Please fill in all of the required fields. </p></div>';

  var scrollHere = document.getElementById('block-system-main');
  scrollHere.scrollIntoView();
}

//converts form data to js object
function convertFormData() {
  var f = {};
  f.title = document.getElementById("edit-submitted-title").value;
  f.fName = document.getElementById("edit-submitted-first-name").value;
  f.lName = document.getElementById("edit-submitted-last-name").value;
  f.email = document.getElementById("edit-submitted-email").value;

  //set values for newsletter
  f.weekly = f.monthly = f.journal = false;

  //get position radio button
  var position = document.getElementsByName('submitted[position]');

  f.position = "";
  for (var i = 0, length = position.length; i < length; i++) {
    if (position[i].checked) {
      f.position = position[i].value;

      // only one radio can be logically checked, don't check the rest
      break;
    }
  }

  //get newsletter button position
  var weekly = document.getElementsByName('submitted[subscribe_me_to][weekly ]');
  if (weekly[0].checked) f.weekly = true;

  var monthly = document.getElementsByName('submitted[subscribe_me_to][monthly ]');
  if (monthly[0].checked) f.monthly = true;

  var journal = document.getElementsByName('submitted[subscribe_me_to][journal ]');
  if (journal[0].checked) f.journal = true;

  //get all of the optional things
  f.website = document.getElementById('edit-submitted-website').value;
  f.address = document.getElementById('edit-submitted-address').value;
  f.city = document.getElementById('edit-submitted-city').value;
  f.state = document.getElementById('edit-submitted-state-province-region').value;
  f.zip = document.getElementById('edit-submitted-postal-zip').value;
  f.country = document.getElementById('edit-submitted-country').value;

  return f;
}

//prepare data for sending
function sendData(data) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      processResponse(this.responseText);
      restoreSubmit();
    }
  };

  xmlhttp.open("POST", "/subscribe.php?" + Math.random(), true);
  xmlhttp.setRequestHeader('Content-Type', 'application/json');
  xmlhttp.send(data);
}

//process response
function processResponse(data) {

  try {

    var arrayResponse = JSON.parse('[' + data.replace(/}{/g, '},{') + ']');

    console.log("logging array: " + arrayResponse);

    arrayResponse.forEach(function(response) {

      if (response.error) {
        if (response.code == 4) {
          showErrMessages("Following information is invalid: " + response.info + "</strong>");
        }

        if (response.code == 8) {
          showWarnMessages("Your email already exists in our list <strong>" + response.list + "</strong>");
        }
      } else {
        if (!response.error) {
          showSuccessMessages("Your email was successfully added to the list " + response.list + "</strong>");
        }
      }
    });

  } catch (e) {
    console.log(e);
  }



  console.log(data);
}



function showErrMessages(str) {
  resBox.innerHTML += '<div class="alert alert-block alert-danger"><a class="close" href="#" data-dismiss="alert">x</a><p></p> <h2 class="element-invisible">Status message</h2><p>' + str + '</p></div>';
}

function showWarnMessages(str) {
  resBox.innerHTML += '<div class="alert alert-block alert-warning"><a class="close" href="#" data-dismiss="alert">x</a><p></p> <h2 class="element-invisible">Status message</h2><p>' + str + '</p></div>';
}

function showSuccessMessages(str) {
  resBox.innerHTML += '<div class="alert alert-block alert-success"><a class="close" href="#" data-dismiss="alert">x</a><p></p> <h2 class="element-invisible">Status message</h2><p>' + str + '</p></div>';
}

function showLoading() {
  document.getElementById("sub-button-1").innerHTML = '<img src=loading.gif>';
  document.getElementById("sub-button-2").innerHTML = '<img src=loading.gif>';
}

function restoreSubmit() {
  document.getElementById("sub-button-1").innerHTML = '<input class="webform-submit button-primary form-submit btn btn-primary" name="op" value="Submit" onclick="submitForm()">';
  document.getElementById("sub-button-2").innerHTML = '<input class="webform-submit button-primary form-submit btn btn-primary" name="op" value="Submit" onclick="submitForm()">';
}
