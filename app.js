////			BUDGET MANAGEMENT APP

///////////			Budget managing app
//---------BUDGET CONTROLLER--------
var budgetController = (function(){
	var Expense = function(id,description,value){
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};

	Expense.prototype.calcPercentages = function(totalIncome){
		if(totalIncome > 0){
			this.percentage = Math.round((this.value / totalIncome) * 100);
		}else{
			this.percentage = -1;
		}
	};

	Expense.prototype.getPercentage = function(){
		return this.percentage;
	};

	var Income = function(id,description,value){
		this.id  = id;
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
		allItems : {
			inc: [],
			exp:[]
		},
		totals : {
			inc: 0,
			exp : 0
		},
		budget : 0,
		percentage : -1
	};

	return{
		addItem: function(type,desp,val){
			var newItem,ID;

			//CREATEE A NEW ID
			if(data.allItems[type].length >0){
				ID = data.allItems[type][data.allItems[type].length - 1].id + 1;		///Last ID + 1
			}else{
				ID = 0;
			}
			

			//CREATE NEW ITEM FROM OUR FUNCTION CONSTRUCTOR
			if(type === 'exp'){
				newItem = new Expense(ID,desp,val);
			}else if(type === 'inc'){
				newItem = new Income(ID,desp,val);
			}

			//PUSHING ELEMENTS IN OUR DATA STRUCTURE
			data.allItems[type].push(newItem);
			return newItem;
		},

		//-------------dELETing items from the array

		deleteItem : function(type,id){
			var ids,index;
			ids = data.allItems[type].map(function(current){
				return current.id;
			});

			console.log(ids);
			index = ids.indexOf(id);

			if(ids !== -1){
				data.allItems[type].splice(index, 1);
			}
		},

		//-----------Calculating the budget and stuff
		calculateBudget : function(){

			//Calcute the total income and expenses
			calculateTotal('exp');
			calculateTotal('inc');
			//Calculate the budget 
			data.budget = data.totals.inc - data.totals.exp;
			//Calculate the percentage of income that was spent
			if(data.totals.inc > 0){
				data.percentage = Math.round((data.totals.exp/data.totals.inc) * 100);
			}else if(data.totals.inc === 0){
				data.percentage = -1;
			}
		},

		//Calculate percentages for expenses

		calculatePercentages : function(){

			data.allItems.exp.forEach(function(cur){
				cur.calcPercentages(data.totals.inc);
			});

		},
		getPercentages : function(){

			var allPercentages = data.allItems.exp.map(function(cur){
				return cur.getPercentage();
			});
			return allPercentages;
			
		
		},

		getBudget :function(){
			return {
				budget : data.budget,
				totalIncome : data.totals.inc,
				totalExpenses : data.totals.exp,
				percentage : data.percentage
			};
		},

		testing: function(){
			return data;
		}
	};


})();

////---------------------------------------------------------------------------------------------
/// -----------UI CONTROLLER-------------
var UIController = (function(){
	var DOMstrings = {
		inputType : '.add__type',
		inputDescription : '.add__description',
		inputValue : '.add__value',
		inputBtn : '.add__btn',
		incomeContainer : '.income__list',
		expensesContainer : '.expenses__list',
		budgetLabel : '.budget__value',
		incomeLabel : '.budget__income--value',
		expensesLabel : '.budget__expenses--value',
		percentageLabel : '.budget__expenses--percentage',
		container : '.container',
		expensesPercLabel : '.item__percentage',
		dateLabel : '.budget__title--month'
	};

	var formatNumber = function(num, type){
			var numSplit,int,dec,type;

			num = Math.abs(num);
			num = num.toFixed(2);
			numSplit = num.split('.');
			int = numSplit[0];
			dec = numSplit[1];

			if(int.length >3 ){ //22,345
				int = int.substr(0, int.length-3) + ',' + int.substr(int.length-3,3)
			}

			//type === 'exp' ? sign ='-' : sign = '+';
			
			return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

		};

			var nodeListener = function(list, callBack){
				for(var i=0; i< list.length; i++){
					callBack(list[i],i);
				}
			};		

	return {
		getInput: function(){
			return{
			type : document.querySelector(DOMstrings.inputType).value,
			description : document.querySelector(DOMstrings.inputDescription).value,
			value : parseFloat(document.querySelector(DOMstrings.inputValue).value)
			};
		},

		addListItem : function(obj,type){
			var html,newHtml,element;
			//CREATE HTML STRING WITH PLACEHOLDER TEXT
			if(type === 'inc'){
				element = DOMstrings.incomeContainer;

				html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}else if(type === 'exp'){
				element = DOMstrings.expensesContainer;

				html ='<div class="item clearfix" id="exp-%id%"><div class="item__description"> %description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}
	
			//REPLACE THE PLACEHOLDER WITH ACTUAL DATA
			newHtml = html.replace('%id%', obj.id);
			newHtml = newHtml.replace('%description%', obj.description);
			newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

			//INSERT THE HTML INTO THE DOM
			document.querySelector(element).insertAdjacentHTML('beforeend' , newHtml);

		},

		///------------DELETE ITEMS FROM THE LIST OF ITEMS

		deleteListItem : function(selectorId){
			var el = document.getElementById(selectorId);
			el.parentNode.removeChild(el);
		},


		///--------------CLEAR FIELDS OF ADD DESCRIPTION AND ADD VALUE--------

		clearFields : function(){
			var fieds,fieldsArr;
			fields = document.querySelectorAll(DOMstrings.inputDescription + ", " + DOMstrings.inputValue);

			fieldsArr = Array.prototype.slice.call(fields);

			fieldsArr.forEach(function(current, index, array){
				current.value = "";
			});

			fieldsArr[0].focus();
		},

		//----------------------

		displayPercentages : function(percentages){
			var field;

			field = document.querySelectorAll(DOMstrings.expensesPercLabel);

			nodeListener(field,function(current,index){
				if(percentages[index] > 0){
					current.textContent = percentages[index];
				}else{
					current.textContent = '---';
				}
				
			});

		},

		///------------UPDATING THE BUDGET AND OTHERS
		displayBudget : function(obj){
			var type;
			obj.budget > 0 ? type = 'inc' : type = 'exp';
			document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
			document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalIncome, 'inc');
			document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExpenses, 'exp');
			

			if(obj.percentage > 0){
				document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
			}else{
				document.querySelector(DOMstrings.percentageLabel).textContent = '---';
			}
		},

		displayDate : function(){
			var year,month,months,now;

			now = new Date();

			year = now.getFullYear();

			months = ['Jan','Feb', 'Mar ' , 'Apr ','May ','Jun ','July','Aug','Sept','Oct','nov','Dec '];
			month = now.getMonth();

			document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
		},

		changedType : function(){

			var field = document.querySelectorAll(
				DOMstrings.inputType +',' +
				DOMstrings.inputDescription +',' +
				DOMstrings.inputValue );

			nodeListener(field,function(current){
				current.classList.toggle('red-focus');
			});

			document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

		},

	getDOMstrings : function(){
			return DOMstrings;
		}
	};
})();

////---------------------------------------------------------------------------------------------
//--------------------CONTROLLER--------------------
var Controller = (function(budgetCtrl,UICtrl){
	
	var setupEventListeners = function(){
		var DOM = UICtrl.getDOMstrings();
		document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);
		document.addEventListener('keypress', function(event){
		if(event.keyCode === 13 || event.which === 13){
			ctrlAddItem();
		}
		});
	document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
	document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
};

	function updateBudget(){

		//Calculate the budget
		budgetCtrl.calculateBudget();

		//Return the budget
		budget = budgetCtrl.getBudget();

		//Display the budget in the UI
		UICtrl.displayBudget(budget);
	};

	///____________Calculate and update percentages
	var updatePercentages = function(){
		// 1. Calculate Percentages
		budgetCtrl.calculatePercentages();
		// 2. Read percentages from the budget controller
		var percentages = budgetCtrl.getPercentages();
		// 3. Update the UI with the new percentage
		UICtrl.displayPercentages(percentages);
	};

	var ctrlAddItem = function(){
		var input,newItem;
		// 1.Get the field input data
		input = UICtrl.getInput();
		
		if(input.description !== "" && !isNaN(input.value) && input.value > 0){
		//2. Add the item to the budject controller
		newItem = budgetCtrl.addItem(input.type,input.description,input.value);
		//3. Add the item to the UI
		UICtrl.addListItem(newItem,input.type);

		//4. CLEAR FIELDS IN THE DES AND VALUE BOX
		UICtrl.clearFields();

		//5. CALCULATE AND UPDATE THE BUDGET
		updateBudget();

		//6. UPdate Percentages
		updatePercentages();

	}
};
	var	ctrlDeleteItem = function(event){
		var itemID,splitID,type,ID;

		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
		
		if(itemID){

			splitID = itemID.split('-');
			type = splitID[0];
			ID = parseInt(splitID[1]);

			// 1. Delete the item from the data structure
			budgetCtrl.deleteItem(type,ID);

			//2. Delete the item from the ui
			UICtrl.deleteListItem(itemID);

			//3.update the values
			updateBudget();

			//4. UPdate Percentages
			updatePercentages();
		}
	};
		
	
	return {
		init: function(){
			console.log("Application is started.");
			UICtrl.displayBudget({
				budget : 0,
				totalIncome : 0,
				totalExpenses : 0,
				percentage : 0
			}
			);

			UICtrl.displayDate();

			setupEventListeners();
		}
	};

})(budgetController,UIController);

Controller.init();