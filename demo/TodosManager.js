define([
	'compose/compose',
	'collections/map',
	'ksf/utils/Evented',
	'ksf/utils/Bacon',
	'ksf/utils/Destroyable',
	'ksf/utils/Observable',
	'ksf/utils/Bindable',
	'ksf/utils/ObservableObject',
	'ksf/components/HtmlElement',
	'ksf/component/CompositeDomComponent',
	'ksf/dom/WithOrderedContent',
	'ksf/collections/List',
	'ksf/collections/OrderableSet',
	'ksf/utils/destroy',
	'./Todo',


	'collections/shim-array',
	'collections/listen/array-changes',
], function(
	compose,
	Map,
	Evented,
	Bacon,
	Destroyable,
	Observable,
	Bindable,
	ObservableObject,
	HtmlElement,
	CompositeDomComponent,
	WithOrderedContentForHtmlElement,
	ReactiveList,
	OrderableSet,
	destroy,
	Todo
){




	var WithEmittingChangedForHtmlElement = function(){
		// listen to dom "change" event to emit ks standardised "changed" event
		this.get('domNode').addEventListener("change", function(){
			this._emit("changed");
		}.bind(this));
	};
	var WithEmittingSubmitForHtmlForm = function(){
		this.get('domNode').addEventListener("submit", function(ev){
			ev.preventDefault();
			this._emit("submit");
		}.bind(this));
	};
	var WithEmittingSubmitForHtmlButton = function(){
		this.get('domNode').addEventListener("click", function(ev){
			this._emit("submit");
		}.bind(this));
	};



// ------------ APP ----------------




	var WithTodosForPresenter = function(args){
		this.toggleLive();

		var remainingTodo = function(todo){
			return !todo.get("done");
		};
		this.setR("remainingCount", this.getR("todos")
			.onEach()
			.map(".filter", remainingTodo)
			.map(".length")
			.skipDuplicates()
		);

		this.setR("stats", this.getR("remainingCount").combine(this.getR("todos", ".length").skipDuplicates(),
			function(remaining, total){
				return total ? remaining + " remaining todos out of " + total : "no todos";
			}
		));

		this.todos = new ReactiveList();
		this.setR("sortedTodos", this.getR("todos").
			onEach().
			map(".sorted", function(a, b){
				return Object.compare(a.get("text"), b.get("text"));
			})
		);


		// plusieurs options possibles pour écrire des 'computed properties'
	/*      this.setR("total", this.getR("qty").combine(this.getR("price"), function(qty, price){
							return qty && price ? qty * price : undefined;
					}));
	*/
	/*      this.setR("total", Bacon.combineWith(function(qty, price){
							return qty && price ? qty * price : undefined;
					}, this.getR("qty"), this.getR("price")));
	*/
	/*      this.when("qty", "price", function(qty, price){
							this.set("total", qty*price);
					});
	*/
		// celles là sont juste des propositions (pas terribles) de syntaxes possibles
		// this.computeR("total", multiply, "qty", "price");
		// this.bindProp("total").to(this, ["qty", "price"], multiply);
	};
	WithTodosForPresenter.prototype = {
		_todoTextGetter: function() {
			return this._Getter('todoText') || "";
		},
		addTodo: function() {
			var todo = new Todo({text:this.get("todoText")});
			this.get("todos").add(todo);
			this.set("todoText", "");
		},
		removeTodo: function(todo){
			var todos = this.get("todos");
			todos.remove(todos.indexOf(todo));
		},
		archive: function() {
			var todos = this.get("todos");
			var doneTodos = todos.filter(function(todo){
				return todo.get("done");
			});
			todos.deleteEach(doneTodos);
		},
		_todosSetter: function(todos){
			this.get("todos").setContent(todos);
		},
		_todosGetter: function(todos){
			return this.todos;
		},
		toggleLive: function(){
			var newState = !this.get("reactive");
			this.setEach({
				"reactive": newState,
				"liveButtonText": newState ? "Stop live" : "Start live",
			});
		},
		moveTodoDown: function(todo){
			var todos = this.get("todos");
			var todoIndex = todos.indexOf(todo);
			todos.move(todoIndex, todoIndex === todos.length-1 ? 0 : todoIndex+1);
		},
		moveTodoUp: function(todo){
			var todos = this.get("todos");
			var todoIndex = todos.indexOf(todo);
			todos.move(todoIndex, todoIndex === 0 ? todos.length-1 : todoIndex-1);
		},
	};


	var SimpleContainer = compose(
		HtmlElement,
		WithOrderedContentForHtmlElement,
		{
			_contentSetter: function(cmps){
				WithOrderedContentForHtmlElement.prototype._contentSetter.call(this, cmps);
				this.updateRendering();
			},
		}
	);


	var ListContainer = compose(
		SimpleContainer,
		function(tag, args){
			var list = this;
			this._cmps = new OrderableSet();
			this._cmps.updateContentMapR(
				this.getR("value").
				flatMapLatestDiff(new OrderableSet(), function(oldItems, newItems){
					var diffChanges = [];
					oldItems && oldItems.forEach(function(item){
						diffChanges.push({type: "remove", value: item, index: 0});
					});
					newItems && newItems.forEach(function(item, index){
						diffChanges.push({type: "add", value: item, index: index});
					});
					return newItems && newItems.asStream("changes").toProperty(diffChanges) || Bacon.constant(diffChanges);
				}),
			args.factory);

			this.setR("content", this._cmps.asReactive());
		}
	);

	var Button = compose(
		HtmlElement,
		WithEmittingSubmitForHtmlButton
	);


	var TodosManager = compose(
		CompositeDomComponent,
		function(){
			var cmps = this._components;

			var presenter = window.presenter = compose.create(ObservableObject, Destroyable, WithTodosForPresenter);
			cmps.addEach({
				presenter: presenter,
			});

			cmps.factories.addEach({
				root: function(){
					return new SimpleContainer("div");
				},
				title: function(){
					return new HtmlElement("h2", {
						innerHTML: "Todos",
					});
				},
				subTitle: function(){
					return new HtmlElement("span");
				},
				todoList: function(){
					return new ListContainer("ul", {
						factory: function(todo){
							// ici on ne crée volontairement pas un composant composite qui encapsule ces sous-composants car on veut, par simplicité, que ces sous-composants appartiennent au todoManager (et pas à list).
							// cela permet de binder directement les propriétés des composants au presenter de todoManager (comme dans l'exemple angularJS)
							var container = new SimpleContainer("li");
							var textDisplayer = new compose(HtmlElement, WithEmittingChangedForHtmlElement)("input");
							var doneEditor = new compose(HtmlElement, WithEmittingChangedForHtmlElement)("input", { type: "checkbox"});
							var deleteButton = new Button("button", { innerHTML: "X"});
							var moveUpButton = new Button("button", { innerHTML: "^"});
							var moveDownButton = new Button("button", { innerHTML: "v"});
							// la question est de savoir comment les enregistrer dans le registre du todoManager... ou faut-il le déléguer à "list" ?
							cmps.addEach([container, textDisplayer, doneEditor, moveUpButton, moveDownButton, deleteButton]);
							container.set("content", [doneEditor, textDisplayer, moveUpButton, moveDownButton, deleteButton]);

							// on enregistre les cancelers sur le container car on sait que c'est un destroyable et qu'il sera détruit lorsque la todo sortira de la liste
							container.own(textDisplayer.bind("value", "<<->", todo, "text"));
							container.own(doneEditor.bind("checked", "<<->", todo, "done"));
							container.own(deleteButton.on("submit", function(){
								presenter.removeTodo(todo);
							}));
							container.own(moveUpButton.on("submit", function(){
								presenter.moveTodoUp(todo);
							}));
							container.own(moveDownButton.on("submit", function(){
								presenter.moveTodoDown(todo);
							}));
							return container;
						},
					});
				},
				newTodoForm: function(){
						return new compose(SimpleContainer, WithEmittingSubmitForHtmlForm)("form"); // new Form(); // TODO: create a Form component
				},
				newTodoText: function(){
					return new compose(HtmlElement, WithEmittingChangedForHtmlElement)("input", { placeholder: "add new todo"});
				},
				addTodoButton: function(){
					return new HtmlElement("button", { type: "submit", innerHTML: "add"});
				},
				liveButton: function(){
					return new compose(HtmlElement, WithEmittingSubmitForHtmlButton)("button");
				},
				sortedToogle: function(){
					return new compose(HtmlElement, WithEmittingChangedForHtmlElement)("input", { type: "checkbox"});
				},
				sortedToogleText: function(){
					return new HtmlElement("span", { innerHTML: "Sort todos by name"});
				},
			});

			// bindings
			cmps.when("presenter", "todoList", function(presenter, list){
				return list.setR("value", presenter.getR("sorted").flatMapLatest(function(sorted){
					return (sorted ? presenter.getR("sortedTodos") : presenter.getR("todos"));
				}));
			});
			// cmps.bindValue("presenter", "stats", "subTitle", "innerHTML");
			cmps.when("presenter", "subTitle", function(presenter, subTitle){
				return subTitle.setR("innerHTML", presenter.getR("reactive").flatMapLatest(function(reactive){
					return reactive ? presenter.getR("stats") : Bacon.never();
				}).skipDuplicates());
			});
			cmps.syncValue("presenter", "todoText", "newTodoText", "value");
			cmps.bindEvent("newTodoForm", "submit", "presenter", "addTodo");
			cmps.bindEvent("liveButton", "submit", "presenter", "toggleLive");
			cmps.bindValue("presenter", "liveButtonText", "liveButton", "innerHTML");
			cmps.syncValue("presenter", "sorted", "sortedToogle", "checked");

			// layout
/*          this._layout.configs.addEach({
				default:
					[["root"], [
						["title"],
						["subTitle"],
						["todoList"],
						["newTodoForm"], [
							["newTodoText"],
							["addTodoButton"],
						],
					]],
			});
			this._layout.set("default");
*/          // manual layout to be removed
			this.set('domNode', this._components.get("root").get('domNode'));
			cmps.get("root").set("content", [
				cmps.get("title"),
				cmps.get("subTitle"),
				cmps.get("liveButton"),
				cmps.get("sortedToogle"),
				cmps.get("sortedToogleText"),
				cmps.get("todoList"),
				cmps.get("newTodoForm"),
			]);
			cmps.get("root").updateRendering();
			cmps.get("newTodoForm").set("content", [
				cmps.get("newTodoText"),
				cmps.get("addTodoButton"),
			]);
			cmps.get("newTodoForm").updateRendering();

		},
		{
			_todosSetter: function(todos){
				this._components.get("presenter").set("todos", todos);
			},
			_todosGetter: function(todos){
				return this._components.get("presenter").get("todos");
			},
		}
	);


	return TodosManager;
});