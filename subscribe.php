<?php

//get input from ajax form
$postdata = file_get_contents("php://input");
$form = json_decode( $postdata);


//make submissions
submitToAirtable($form); 
subscribeToSales($form);

//this function submits to all of the lists the person wants to subscribe to
function subscribeToSales( $data ){

  if($data->weekly){
    handleError(submitToSalesforce($data, LIST_NUMBER), "Weekly newsletter");
  }

  if($data->journal){
    handleError(submitToSalesforce($data, LIST_NUMBER), "Evmed Journal club newsletter");
  }

  if($data->monthly){
    handleError(submitToSalesforce($data, LIST_NUMBER), "Monthly newsletter");
  }

}

//This part handles errors and returns the object
function handleError($str, $listName){

  $error = mb_substr($str, strpos($str, "http://www."), strpos($str, "\">here</a>") - strpos($str, "<a href=\"") - 9);
  $parsed = parse_url($error);

  $retObject = new stdClass();
  $retObject->list = $listName;

  if($parsed['host'] == "www.error.com"){
    parse_str($parsed['query'], $queryData);


    $retObject->error = TRUE;
    $retObject->code = $queryData['errorcode'];
    $retObject->info = $queryData['amp;errorcontrol'];


  } elseif($parsed['host'] == "www.success.com"){

    $retObject->error = FALSE;
    $retObject->info = "You have been successfully subscribed";

  } else{
    var_dump($str);
  }

  echo json_encode($retObject);
}

//this part submits to salesforce, make sure to upto MID and YOUR DEPARTMENT NAME
function submitToSalesforce( $data, $list ){
    $post = [
        'thx' => 'http://www.success.com/',
        'err' => 'http://www.error.com/',
        'usub'   => 'http://www.unsub.com/',
        'MID' => YOUR MID,
        'YOUR DEPARTMENT NAME' => 'TRUE',
        'First Name'   => $data->fName,
        'Last Name'	   => $data->lName,
        'Email Address' => $data->email
    ];

    $ch = curl_init('http://cl.s7.exct.net/subscribe.aspx?lid=' . $list );
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $post);
    $response = curl_exec($ch);
    curl_close($ch);
    return $response;
}

// this is an optional part that submits the data to airtable as well
// useful if you want to keep data in multiple places.
function submitToAirtable( $data ){
    $url = "#"; 

		$newsletter = [];

		if($data->weekly){
				$newsletter[] = "\"Weekly\"";
		}

		if($data->monthly){
			$newsletter[] = "\"Monthly\"";
		}

		if($data->journal){
			$newsletter[] = "\"Journal\"";
		}

		$newsletter = implode(", ", $newsletter);
		$position = sanatizePos($data->position);

    $postthis = '{
	"fields": {
    "First Name": "'. $data->fName . '",
	"Last Name": "' . $data->lName . '",
	"Email": "'. $data->email . '",
	"Position":"'. $position .'",
	"Title": "'. $data->title . '",
	"Street Address": "'. $data->address . '",
	"State/Prov/Region": "'. $data->state . '",
	"City": "'. $data->city . '",
	"Postal/Zip": "'. $data->zip . '",
	"Country": "'. $data->country . '",
	"Website": "'. $data->website . '",
	"Newsletter": ['. $newsletter .']
		}
	}';

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL,$url);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        'Authorization: Bearer YOUR API KEY',
        'Content-type: application/json',
    ));
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postthis);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $data = curl_exec($ch);
    curl_close($ch);
    return $data;
}

//this function santizes form input for airtable
function sanatizePos($str){
	switch($str){
		case "asu_faculty ":
			return "ASU Faculty";
		case "other_faculty ":
			return "Other Faculty";
		case "health professional ":
			return "Health Professional";
		case "student ":
			return "Student";
		case "staff ":
			return "Staff";
		case "supporter ":
			return "Community supporter of evolution and medicine";
    default:
      return "Nill";
	}
}

?>
