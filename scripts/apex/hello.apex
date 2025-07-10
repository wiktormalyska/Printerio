List<Contract> contracts = [SELECT Id, Name FROM Contract];
delete contracts;
List<Order> orders = [SELECT Id, Name FROM Order];
delete orders;