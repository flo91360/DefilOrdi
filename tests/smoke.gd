extends SceneTree

const Session = preload("res://scripts/typing_session.gd")
const Store = preload("res://scripts/store.gd")
var failures = 0

func check(condition: bool, message: String) -> void:
	if not condition:
		push_error(message)
		failures += 1

func _initialize() -> void:
	call_deferred("run")

func run() -> void:
	var session = Session.new("été")
	session.update_input("é", 1000)
	session.update_input("éx", 2000)
	session.update_input("é", 2500)
	session.update_input("ét", 3000)
	session.update_input("été", 4000)
	var stats = session.stats(9000)
	check(session.finished, "Accented phrase must finish")
	check(stats.attempts == 4, "Corrections must retain failed attempts")
	check(is_equal_approx(stats.precision, 75.0), "Accuracy must include corrected error")
	check(is_equal_approx(stats.seconds, 3.0), "Timer must freeze on completion")
	check(is_equal_approx(stats.cpm, 80.0), "CPM must use attempted characters")
	var store = Store.new()
	store.profiles = [{"name": "Étoile", "avatar": "Chat", "color": "75c9ff", "sound": 0, "results": []}]
	store.active = 0
	check(store.save_data() == OK, "Profile must save")
	var restored = Store.new()
	restored.load_data()
	check(restored.current().get("name") == "Étoile", "Profile must reload")
	var app = load("res://scenes/main.tscn").instantiate()
	root.add_child(app)
	await process_frame
	check(app.store.current().get("name") == "Étoile", "App must restore profile")
	app.show_profile(false)
	app.show_phrases()
	app.show_typing()
	app.input.text = app.session.target
	app.input.text_changed.emit(app.input.text)
	check(app.session.finished, "UI must finish exercise")
	check(app.store.current().results.size() == 1, "UI must save one result")
	app.input.text_changed.emit(app.input.text)
	check(app.store.current().results.size() == 1, "Completion must not save twice")
	app.show_history()
	app.show_home()
	app.queue_free()
	await process_frame
	print("Smoke checks: ", "PASS" if failures == 0 else "FAIL", " (", failures, " failures)")
	quit(0 if failures == 0 else 1)
