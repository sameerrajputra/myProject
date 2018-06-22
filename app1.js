//		BUDGET CONTROLLER

var budgetController = (function(){

	var Expense = function(id, description, value){
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};

	Expense.prototype.calcPercentages = function(totalIncome){
		if(totalIncome > 0){
		this.percentage = Math.round((this.value/totalIncome) * 100);			
		}else{
			this.percentage = -1;
		}
	};

	Expense.prototype.getPercentage = function(){
		return this.percentage;
	};

	var Income = function(id, description, value){
		this.id = id;
		this.description = description;
		this.value = value;
	};

	var calculateTotal = function(type){
		var sum = 0;

		data.allItems[type].forEach(function(current){
			sum += current.value;
		});

		data.totals[type] = sum;
	};

	var data = {
		allItems: {
			exp: [],
			inc: []
		},
		totals: {
			exp: 0,
			inc: 0
		},
		budget: 0,
		percentage: -1
	};

	return {
		addItem: function(type,des,val){
			var newItem,ID;

			//Creating a new ID for items
			if(data.allItems[type].length > 0 ){
				ID = data.allItems[type][data.allItems[type].length - 1].id+1;
			}else{
				ID = 0;
			}
			
			//Creating new Items from the income and expense function constructor
			if(type === 'inc'){
				newItem = new Income(ID,des,val);
			}else if(type === 'exp'){
				newItem = new Expense(ID,des,val);
			}

			//Pushing the new Items to the data structure
			data.allItems[type].push(newItem);
			//return the new Item to use in other modules
			return newItem;
		},

		deleteItem: function(type,id){
			var IDs,index;
			// id = [0, 1, 2, 4, 5] if we want to delete id 4 then we cannot simply pass id 4 
			//we cannot use data.allItems[type][id]
			// because id 4 will be 5 so we first have to list the ids and find index of 4 and then delete
			//index = 3

			IDs = data.allItems[type].map(function(current){
				return current.id;
			});

			index = IDs.indexOf(id);

			if(index !== -1){
				data.allItems[type].splice(index,1);
			}
		},

		calculateBudget: function(){

			// Calculate total income and expenses
			calculateTotal('inc');
			calculateTotal('exp');

			// Calculate the total budget
			data.budget = data.totals.inc - data.totals.exp;

			//Calculate the percentage of expense
			if(data.totals.inc > 0){
				data.percentage = Math.round((data.totals.exp/data.totals.inc)*100);
			}else{
				data.percentage = -1;
			}
			
		},

		calculatePercentages: function(){

			data.allItems.exp.forEach(function(current){
				current.calcPercentages(data.totals.inc);
			});

		},

		getBudget: function(){
			return {
				budget: data.budget,
				percentage: data.percentage,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp

			}
		},

		getPercentages: function(){
			var allPerc = data.allItems.exp.map(function(current){
				return current.getPercentage();
			});

			return allPerc;
		},

		testing: function(){
			return data;
		}
	};

})();


//		UI CONTROLLER

var UIController = (function(){
	var DOMstrings =  {
		inputType : '.add__type',
		inputDesc : '.add__description',
		inputValue : '.add__value',
		inputBtn : '.add__btn',
		incomeContainer: '.income__list',
		expensesContainer: '.expenses__list',
		budgetLabel: '.budget__value',
		incomeLabel: '.budget__income--value',
		expensesLabel: '.budget__expenses--value',
		percentageLabel:'.budget__expenses--percentage',
		container: '.container',
		expensesPercLabel: '.item__percentage',
		dateLabel: '.budget__title--month'
	};

	var formatNumber = function(num,type){
		// 				12,345
		var num,numSplit,int,dec;

		num = Math.abs(num); //Ignores the + or - sign
		num = num.toFixed(2); //adds two decimal fixed

		numSplit = num.split('.');
		int = numSplit[0];

		if(int.length > 3){
			int = int.substr(0, int.length - 3) + ',' + int.substr(int.length-3, 3);
		}

		dec = numSplit[1];

		return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
	};

	nodeListForEach = function(list,callback){
	for(var i = 0; i < list.length; i++){
		callback(list[i], i);
		}

	};


	return{
		getInput : function(){
			return{
				type : document.querySelector(DOMstrings.inputType).value,  // will be either inc or exp
				description: document.querySelector(DOMstrings.inputDesc).value,
				value : parseFloat(document.querySelector(DOMstrings.inputValue).value)
			};
		},

		addListItem: function(obj,type){
			var html,newHtml,element;
			//Create placeholder for the list items
			if(type === 'inc'){
				element = DOMstrings.incomeContainer;
				html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			
			}else if(type === 'exp'){
				element = DOMstrings.expensesContainer;
				html ='<div class="item clearfix" id="exp-%id%"><div class="item__description"> %description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}

			//Replace placeholder with the actual data
			newHtml = html.replace('%id%' , obj.id);
			newHtml = newHtml.replace('%description%' , obj.description);
			newHtml = newHtml.replace('%value%' , formatNumber(obj.value,type));

			//Displaying the html
			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

		},

		deleteListItem: function(selectorID){
			var el = document.getElementById(selectorID);

			//removing an element from a DOM..we have to delete items from the parent Node only
			el.parentNode.removeChild(el);

		},

		clearField: function(){
			var field, fieldArr;

			field = document.querySelectorAll(DOMstrings.inputDesc + ', ' + DOMstrings.inputValue);
			
			fieldArr = Array.prototype.slice.call(field);

			fieldArr.forEach(function(current,index,array){
				current.value = '';
			});

			fieldArr[0].focus();
		},

		displayBudget: function(obj){
			document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, obj.budget > 0 ? 'inc' : 'exp');
			document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
			document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp,'exp');

			if(obj.percentage > 0){
				document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
			}else{
				document.querySelector(DOMstrings.percentageLabel).textContent = '---';
			}
			

		},
		displayPercentages: function(per){
			/*			USING prototype slice and for Each
			var i=0;
			var fields,fieldArr;
			fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
			fieldArr = Array.prototype.slice.call(fields);

			fieldArr.forEach(function(current){
				
					current.textContent = per[i] + '%';
				i++;
			});
			*/
			var fields,nodeListForEach;
			fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

			nodeListForEach(fields, function(current,index){
				if(per[index] > 0){
					current.textContent = per[index] + '%';
				}else{
					current.textContent = '---';
				}
				
			});
		},

		changedType: function(){
			var field = document.querySelectorAll(
				DOMstrings.inputType + ',' +
				DOMstrings.inputDesc + ',' +
				DOMstrings.inputValue
				);

			nodeListForEach(field,function(current,index){
				current.classList.toggle('red-focus');
			});

			document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
		},

		getDate: function(){
			var now,year,month;

			now = new Date();
			year = now.getFullYear();
			month = now.getMonth();
			day = now.getDay();

			document.querySelector(DOMstrings.dateLabel).textContent = year ;

		},

		getDOMstrings : function(){
			return DOMstrings;
		}

};
})();



//		APP CONTROLLER

var controller = (function(budgetCtrl,UICtrl){
	var setupEventListeners = function(){
		var DOM = UICtrl.getDOMstrings();
		document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);

		document.addEventListener('keypress',function(event){
		if(event.keyCode === 13 || event.which === 13){
			ctrlAddItem();
		}
	});

		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

		document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
	};

	function updateBudget(){
		var budget;

		//	1.Calculate the budget
		budgetCtrl.calculateBudget();

		//	2.Return the budget
		budget = budgetCtrl.getBudget();
		
		//	3.Display the budget in the UI
		UICtrl.displayBudget(budget);

	};

	var updatePercentages = function(){

		//Calculate the percentages
		budgetCtrl.calculatePercentages();

		//Read the percentages from the budget COntroller
		var percentages = budgetCtrl.getPercentages();

		//Update the UI
		UICtrl.displayPercentages(percentages);
	};	

	function ctrlAddItem(){
		var input,newItem;

		//	1.Get the input from the fields
			input = UICtrl.getInput();
		
		if(input.description !== '' && !isNaN(input.value) && input.value > 0){
		// 	2.Add the item to the budget Controller
			newItem = budgetCtrl.addItem(input.type, input.description, input.value);

		// 	3.Add the item to the UI
			UICtrl.addListItem(newItem, input.type);

		//	4.Clear the input fields
			UICtrl.clearField();

		//	5.Update the budget
			updateBudget();

		//	6.Update the percentages
			updatePercentages();
		}

	};

	var ctrlDeleteItem = function(event){
		var itemID,splitID,id,type;

		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

		if(itemID){
			splitID = itemID.split('-');
			ID = parseInt(splitID[1]);
			type = splitID[0];

			//	1.Delete an item from the data structure
			budgetCtrl.deleteItem(type,ID);

			//	2.Delete an item from the UI
			UICtrl.deleteListItem(itemID);

			//	3.Calculate and update the budget
			updateBudget();

			//	4.Update the percentages
			updatePercentages();

		}
	};
	
	return {
		init: function(){
		UICtrl.getDate();
		UICtrl.displayBudget({
			budget: 0,
			percentage: '---',
			totalInc: 0,
			totalExp: 0
		});
		setupEventListeners();	
		}
	};

})(budgetController,UIController);

controller.init();










