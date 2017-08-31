var inquirer = require("inquirer");
var mysql = require("mysql");

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'UPPERlower123!@#',
  database : 'bamazon'
});

function displayResults(results){
	var buffer = "";
	for(var i = 0; i < results.length; i++){
		buffer += "Item ID: " + results[i].item_id + "\r\n";
		buffer += "Product Name: " + results[i].product_name + "\r\n";
		buffer += "Price: " + results[i].price + "\r\n";
		buffer += "Stock Quantity: " + results[i].stock_quantity + "\r\n";
		buffer += "Department Name: " + results[i].department_name + "\r\n";
		buffer += "\r\n";
  	}
  	console.log(buffer);
};

function viewProducts(){
	var selectAllQuery = "SELECT * from products";
	var buffer = "";
	buffer += "Bamazon Inventory: \r\n"
	connection.query(selectAllQuery, function (error, results, fields) {
  		if (error) throw error;
  		console.log(buffer);
  		//console.log(results);
  		displayResults(results);
  		//connection.end();
  		showMenu();
	});
};
function viewLowInventory(){
	var lowInventoryQuery = "SELECT * from products WHERE stock_quantity < 5";
	var buffer = "";
	buffer += "Low-Inventory Items: \r\n";

	connection.query(lowInventoryQuery, function (error, results, fields) {
  		if (error) throw error;
  		console.log(buffer);
  		displayResults(results);
  		showMenu();
	});
};
function addToInventory(){
	var selectAllQuery = "SELECT * from products";
	
	connection.query(selectAllQuery, function (error, results, fields) {
  		if (error) throw error;
  		// console.log(buffer);
  		//console.log(results);
  		
  		var ids = [];
  		var products = results;
  		for(var i =0; i < results.length; i ++){
  			ids.push(results[i].item_id.toString());
  		}
  		
  		inquirer.prompt([
		{
			type: "list",
			name: "updateItem",
			message: "Select the ID of the item would you like to update",
			choices: ids
		},
		{
			type: "input",
			name: "updateQty",
			message: "How many units would you like to add?",
		}

		]).then(function(response){
			if(isNaN(response.updateQty)){
				console.log("\r\nPlease enter a positive number for update quantity\r\n");
				showMenu();
			}
			else if(response.updateQty < 1){
				console.log("\r\nPlease enter a positive number for update quantity\r\n");
				showMenu();
			}
			else{
				var updateProduct;
				for(var i = 0; i < products.length; i++){
					if(products[i].item_id == response.updateItem){
						// console.log(products[i].item_id);
						updateProduct = products[i];
					}
				}
				var updateQuery = "UPDATE products SET stock_quantity = " + (updateProduct.stock_quantity + parseInt(response.updateQty)) + " WHERE item_id = " + updateProduct.item_id;
				// console.log("Records updated.");
				// console.log(updateQuery);

				connection.query(updateQuery, function (error, results, fields) {
			  		if (error) throw error;
			  		console.log(updateProduct.product_name + ": " + (updateProduct.stock_quantity + parseInt(response.updateQty)) + " units in stock.");
			  		showMenu();
				});

			}
			
		});


  		//connection.end();
  		// showMenu();
	});	
};
function addNewProduct(){
	inquirer.prompt([
		{
			type: "input",
			name: "product_name",
			message: "Product Name:"
		},
		{
			type: "input",
			name: "department_name",
			message: "Department Name:"
		},
		{
			type: "input",
			name: "price",
			message: "Price: (enter a number)"
		},
		{
			type: "input",
			name: "stock_quantity",
			message: "Stock Quantity:"
		}

		]).then(function(response){

			var addNewQuery = "INSERT INTO products(product_name, department_name, price, stock_quantity)";
			addNewQuery	+= " VALUES('" + response.product_name + "', '" + response.department_name	+ "', " + response.price + ", " + parseInt(response.stock_quantity) +")";
			if(isNaN(response.price) || isNaN(parseInt(response.stock_quantity))){
				console.log("please enter a number for price and stock_quantity");
				showMenu();
			}
			else if(response.price < 0 || response.stock_quantity < 0 ){
				console.log("please enter a positive number for price and stock_quantity");
				showMenu();
			}

			else{
				connection.query(addNewQuery, function (error, results, fields) {
			  		if (error) throw error;
			  		console.log("New product added.");
			  		showMenu();
			  		
				});
			}

	});
};

function quit(){
	console.log("Thank you. goodbye.");
	connection.end();
}
function Manager(){
	this.viewProducts = viewProducts;
	this.viewLowInventory = viewLowInventory;
	this.addToInventory	= addToInventory;
	this.addNewProduct	= addNewProduct;
};
var manager = new Manager();

function showMenu(){
	inquirer.prompt([
		{
			type: "list",
			message: "Select One: ",
			choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Quit"],
			name: "choice"
		}


		]).then(function(responses){
			if(responses.choice == "View Products for Sale"){
				
				manager.viewProducts();
			}
			else if(responses.choice == "View Low Inventory"){
				manager.viewLowInventory();
			}
			else if(responses.choice == "Add to Inventory"){
				manager.addToInventory();
			}
			else if(responses.choice == "Add New Product"){
				manager.addNewProduct();
			}
			else if(responses.choice == "Quit"){
				quit();
			}

	});
}
showMenu();