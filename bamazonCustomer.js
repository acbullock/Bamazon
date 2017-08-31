var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'UPPERlower123!@#',
  database : 'bamazon'
});


//queries
var getAllProductsQuery = "SELECT * FROM products";
var products = [];


//functions

function processSale(id, qty){
	for(var i = 0; i < products.length; i++){
		if(products[i].item_id	== id){
			if(qty > products[i].stock_quantity){
				console.log("\r\nNot enough in stock. There are only " +  products[i].stock_quantity + " units left.\r\n");
				order();
				return;
			}
			else{

				var updateQtyQuery = "UPDATE products SET stock_quantity  = " + (products[i].stock_quantity - qty) + " WHERE item_id = " + products[i].item_id;
				
				var total = products[i].price * qty;
				connection.query(updateQtyQuery, function (error, results, fields) {
					
					if (error) throw error;
					console.log("\r\nSale Complete!");
					console.log("Total: $" + total.toFixed(2));
					
					// console.log(products[i]);

					
					//displayAllProducts();
				});
				connection.end();
				return;
			}
		}
	}
}
function order(){
	inquirer.prompt([
			{
				type: "input",
				message: "Enter the Item ID of the product you wish to purchase.",
				name: "wantId"
			},
			{
				type: "input",
				message: "How many units of the product would you like to buy?",
				name: "wantQty"
			}

			]).then(function(response){
				if(isNaN(parseInt(response.wantId)) || isNaN(parseInt(response.wantQty))){
					console.log("\r\nError: Please enter a number for the Id and the quantity.\r\n");
					order();
					return;
				}
				else{
					var found = false;
					for(var i = 0; i < products.length; i++){
						if(products[i].item_id	== response.wantId){
							found = true;
							processSale(response.wantId, response.wantQty);

						}
					}
					if(!found){
						console.log("\r\nError: Item Id not found. Try again.\r\n");
						order();
					}
				}
		});
}
function displayAllProducts(){
	var buffer = "";
	
	buffer += "Bamazon Inventory:\r\n\r\n";
	
	//connection.connect();
	connection.query(getAllProductsQuery, function (error, results, fields) {
		if (error) throw error;
		products = results;
		//connection.end();

		//display each product's info.
		for(var i = 0; i < products.length; i++){
			buffer += "Item ID: " + products[i].item_id + "\r\n";
			buffer += "Product Name: " + products[i].product_name + "\r\n";
			buffer += "Department Name: " + products[i].department_name + "\r\n";
			buffer += "Price: " + products[i].price + "\r\n";
			buffer += "Stock Quantity: " + products[i].stock_quantity + "\r\n";
			buffer += "\r\n";
		}
		console.log(buffer);
		order();

		




	});
}

displayAllProducts();



