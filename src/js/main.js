(function (window, angular) {
	'use strict';
	
	var TEMPLATEPATH = '/dist/views/';
	var app = angular.module('website-builder',['ui.router']);

	// for setting the routes
	app.config(["$stateProvider","$urlRouterProvider",function($stateProvider,$urlRouterProvider){
		$stateProvider
		.state('login',{
			url:'/login',
			templateUrl: TEMPLATEPATH + 'partial_login.html',
			controller: "loginController"
		})
		.state('signup',{
			url:'/signup',
			templateUrl: TEMPLATEPATH + 'partial_signup.html',
			controller: "signupController"
		})
		.state('home',{
			url:'/home/:username',
			templateUrl: TEMPLATEPATH + 'home.html',
			controller: "homeController",
			onEnter:function(localStorage,$state){
				var currentUser = localStorage.getCurrentUser();
				console.log("current user",currentUser);
				if(!currentUser.email){
					$state.go('login');
				}
			}
		})

		$urlRouterProvider.otherwise(function ($injector) {
            var $state = $injector.get("$state");
            $state.go('login');
        });
	}])

	// for setting current user details in root scope
	app.run(['$rootScope',"$window",'localStorage',function($rootScope,$window,localStorage){
		$rootScope.currentUser = localStorage.getCurrentUser();
	}])


	// for login
	app.controller("loginController",['$scope','$rootScope','$window','localStorage','$state', function($scope,$rootScope,$window,localStorage,$state){
		console.log("inside login Controller");
		$scope.user = {};
		$scope.errorMsg = '';

		$scope.validateUser = function(){

		}

		$scope.loginFn = function(){
			var userList = localStorage.getUserList();
			var login = false;
			if(userList){
				angular.forEach(userList,function(list){
					console.log("list",list)
					if(list.email == $scope.user.email){
						if(list.password == $scope.user.password){
							$rootScope.currentUser = list;
							localStorage.setCurrentUser(list);
							$state.go("home",{'username':list.name});
						}
						else{
							$scope.errorMsg = 'Invalid Credential.';
						}
					}
					else{
						$scope.errorMsg = 'You are not registered with us Please signup.'
					}
					
				})
			}
			else{
				$scope.errorMsg = 'You are not registered with us Please signup.'
			}
		}
	}])

	// for signup 
	app.controller("signupController",['$scope','$rootScope','$window','localStorage','$state',function($scope,$rootScope,$window,localStorage,$state){
		console.log("inside signup Controller");
		$scope.user = {};
		$scope.errorMsg = '';
		$scope.signupFn =function(){
			var userList = localStorage.getUserList();
			var count = 0;
			angular.forEach(userList,function(list){
				if(list.email == $scope.user.email){
					count ++;
				}
			})
			if(count > 0){
				$scope.errorMsg = 'Email is already Exist, Please signup with diffrent email.'
			}
			else{
				localStorage.setUserList($scope.user);
				$state.go('login');	
			}
		}

	}])


	// home controller for handling all drag drop resize generate code feature
	app.controller("homeController",['$scope','$rootScope','$window','$state','$compile',function($scope,$rootScope,$window,$state,$compile){
		console.log("inside home Controller");
		$scope.currentUser = $rootScope.currentUser;
		$scope.designCode = '';
		$window.localStorage.setItem('isPrint',0);
		$scope.count = 0;

		$scope.logout = function(){
			$window.localStorage.removeItem('currentUser');
			$rootScope.currentUser = {};
			$state.go('login');

		}

		$scope.generateCode = function(){
			if(parseInt($window.localStorage.getItem('isPrint')) == 0){
				$scope.designCode = angular.element('#action-code').html();
				$scope.designCode = $scope.designCode.replace(/<!--(?!>)[\S\s]*?-->/gm,'');
				console.log($scope.designCode);
				$('#getCodeModal').modal('show');
			}
			else{
				$window.alert("Please save or discard your work then generate code.");
			}
		}

		$('.draggable-header').draggable({
	        revert: false,
	        helper: "clone",
	        cursor: "move", 
	        revertDuration:0
    	})

    	

		$( "#action" ).droppable({
			accept:('.draggable-header'),
			drop: function( event, ui ) {
				var item = $(ui.draggable).clone();
				var type = $(ui.draggable)[0].dataset['type'];

				item.empty();
				item.removeClass();
				item.addClass('droped-item draggable resizable')
				item.css({'border':"2px solid #dcdcdc","width": "100%",
						"position":"relative !important",
					    "min-height": "100px",
					    "padding": "0.5em",
					    "margin": "5px !important",
		    			"display":"inline-block"});
				
				item.draggable({
					containment: "#action"
				});
				item.resizable({
    				containment: "#action"
				});
				var directiveText = "<div style='width:100%;height: 100%;' content-editable type=" + type + "></div>";
				var comiledElement = $compile(directiveText)($scope);
				$scope.count ++;
				item.append(comiledElement);

				angular.element('#action').append(item);
			}
	    })

	}])


	// service for handle login ,current user and all userList
	app.factory("localStorage",['$window',function($window){
		return {
			getCurrentUser:function(){
				var data = $window.localStorage.getItem('currentUser') ? JSON.parse($window.localStorage.getItem('currentUser')) :{};
				return data;
			},
			setCurrentUser:function(user){
				var data = JSON.stringify(user);
				$window.localStorage.setItem('currentUser',data);
			},
			getUserList:function(){
				var data = JSON.parse($window.localStorage.getItem('userList'));
				return data;
			},
			setUserList:function(user){
				var data = $window.localStorage.getItem('userList')  ? JSON.parse($window.localStorage.getItem('userList')):[];
				data.push(user);
				data = JSON.stringify(data);
				$window.localStorage.setItem('userList',data);
			}


		};
	}])


	// Deirective for editing Droped element
	app.directive("contentEditable",function(){
		return {
			restrict:'A',
			scope:{
				type:'@'
			}, 
			templateUrl:'dist/views/contentEditable.html',
			controller:['$scope','$window',function($scope,$window){
				console.log("inside directive controller",$scope);
				$scope.isEditable = false;
				$scope.shownData = {
					headerMsg : "This is Header Text",
					paragraphMsg : "This is paragraph text",
					imageUrl : "https://imgur.com/P7LmaTe.jpg",
					anchorUrl : "https://www.moengage.com/",
					anchorDescription : "This is our website",
				}

				$scope.data = {};

				$scope.changeEditMode = function(){
					$scope.isEditable = !$scope.isEditable;
					var count = parseInt($window.localStorage.getItem('isPrint'));
					if($scope.isEditable){
						$scope.setData();
						$window.localStorage.setItem('isPrint',count + 1);
					}
					else{
						$window.localStorage.setItem('isPrint',count - 1);
					}
				}

				$scope.setData = function(){
					angular.forEach($scope.shownData,function(value,key){
						$scope.data[key] = value;
					})
				}
				$scope.goToLink = function(){
					$window.open($scope.shownData.anchorUrl, '_blank');
				}

				$scope.updateContent = function(){
					switch($scope.type){
						case 'header' : $scope.shownData.headerMsg = $scope.data.headerMsg;
										break;
						case 'paragraph' : $scope.shownData.paragraphMsg = $scope.data.paragraphMsg;
										break;
						case  'image'	: $scope.shownData.imageUrl = $scope.data.imageUrl;
											break;
						case  'anchor'  : $scope.shownData.anchorUrl = $scope.data.anchorUrl;
											$scope.shownData.anchorDescription = $scope.data.anchorDescription;
											break;
						default :		console.log("undefined type");		
					}

					$scope.data ={};
					$scope.isEditable =false;
				}
			}]
		}
	})

}(window, angular));	