<?php 
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once $_SERVER['DOCUMENT_ROOT'].'Path to PHP main functions file';

$documents = new Document;

if(isset($_POST["data_array"])){
    $data = $_POST["data_array"];
    $updateSql = [];

for($i=0;$i<count($data);$i++){
    $id = $data[$i]['row_id'];
    $col='';
    switch($data[$i]['col_name']){
        case 'Value 1':
            $col = 'product_name';
            break;
        case 'Value 2':
            $col = 'product_quantity';
            break;
        case 'Value 3':
            $col = 'product_code';
            break;
        case 'Value 4':
            $col = 'product_min_per_order';
            break;
        case 'Value 5':
            $col = 'barcode';
            break;
        case 'Value 6':
            $col = 'name2';
            break;
    }
    $value = $data[$i]['value'];
    array_push($updateSql,"UPDATE table_1 SET table_1.$col = '$value' WHERE table_1.product_id = '$id'");
}


for($i=0;$i<count($updateSql);$i++){
    $documents->submit($updateSql[$i]);
}
}

if(isset($_POST["product_code"])){
    $product_code = $_POST["product_code"];
    
    $codeSql = "SELECT table_1.product_code FROM table_1 WHERE table_1.product_code = '$product_code'";
    
    $res = $documents->fetchData($codeSql);
    echo json_encode($res);    
}



