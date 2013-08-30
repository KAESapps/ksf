define([
	"doh/runner",
	"../array",
], function(doh, arrayUtils){

	var sameArray = arrayUtils.sameArray;
	
	doh.regsiter("sameArray tests", {
		"numeric arrays non strict mode": function(t){
			t.t(sameArray([1,2,3], [3,2,1]));
			t.f(sameArray([1,2,3], [3,1]));
			t.f(sameArray([1,2,3], [3,5,1]));
		},
		"string arrays non strict mode": function(t){
			t.t(sameArray(["1","2","3"], ["3","2","1"]));
			t.f(sameArray(["1","2","3"], ["3","1"]));
			t.f(sameArray(["1","2","3"], ["3","5","1"]));
		},
		"objects arrays non strict mode": function(t){
			t.t(sameArray([{name:"toto"},{name:"titi"},{name:"tata"}], [{name:"tata"},{name:"titi"},{name:"toto"}]));
			t.f(sameArray([{name:"toto"},{name:"titi"},{name:"tata"}], [{name:"tata"},{name:"toto"}]));
			t.f(sameArray([{name:"toto"},{name:"titi"},{name:"tata"}], [{name:"tata"},{name:"titi"},{name:"toto"}]));
		},
		"numeric arrays strict mode": function(t){
			t.t(sameArray([1,2,3], [3,2,1], true));
			t.f(sameArray([1,2,3], [3,1], true));
			t.f(sameArray([1,2,3], [3,5,1], true));
		},
		"string arrays non strict mode": function(t){
			t.t(sameArray(["1","2","3"], ["3","2","1"], true));
			t.f(sameArray(["1","2","3"], ["3","1"], true));
			t.f(sameArray(["1","2","3"], ["3","5","1"], true));
		},
		/*TODO
		"objects arrays strict mode": function(t){
		},
		*/
	});
});
