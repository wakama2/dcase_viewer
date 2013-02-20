Import("Deos.DCaseCloud");
Import("Type.Json");

void main() {

	API repo = new API("dcasedb","dcasedb");
	Json Ids = repo.GetArgumentIds();
	DCaseArgument argument = repo.GetArgument(1);
	System.p(argument.toJson());

	System.p(repo.GetContext(argument.GetDBNode(4)));
}

main();
