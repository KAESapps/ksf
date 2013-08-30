define([

], function(

){
	var bindProps = function(leftProp, dir, rightProp, options){
		return function(left, right) {
			right = right || this;
			var source, sourceProp, target, targetProp, mode;

			// like a switch case but easier... no ?
			var dirSwitch = {
				'>': function() {
					source = left;
					sourceProp = leftProp;
					target = right;
					targetProp = rightProp;
					mode = "unidirectional";
				},
				'<': function(){
					source = right;
					sourceProp = rightProp;
					target = left;
					targetProp = leftProp;
					mode = "unidirectional";
				},
				'<->>': function() {
					source = left;
					sourceProp = leftProp;
					target = right;
					targetProp = rightProp;
					mode = "bidirectional";
				},
				'<<->': function() {
					source = right;
					sourceProp = rightProp;
					target = left;
					targetProp = leftProp;
					mode = "bidirectional";
				},
			};
			dirSwitch[dir]();

			if (mode === "unidirectional"){
				return target.setR(targetProp, source.getR(sourceProp));
			} else if (mode === "bidirectional") {
				return target.bind(targetProp, source, sourceProp);
			}
		};
	};
	return bindProps;
});