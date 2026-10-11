extends RefCounted

const PATH = "user://profiles.json"
var profiles: Array = []
var phrases: Array = ["Le petit chat regarde la lune.", "Je découvre les touches du clavier.", "À bientôt pour une nouvelle aventure !"]
var active: int = -1

func load_data() -> void:
	if not FileAccess.file_exists(PATH):
		return
	var file = FileAccess.open(PATH, FileAccess.READ)
	if file == null:
		return
	var data = JSON.parse_string(file.get_as_text())
	if data is Dictionary and data.get("profiles") is Array and data.get("phrases") is Array:
		profiles = data.profiles
		phrases = data.phrases
		active = 0 if not profiles.is_empty() else -1

func save_data() -> Error:
	var file = FileAccess.open(PATH, FileAccess.WRITE)
	if file == null:
		return FileAccess.get_open_error()
	file.store_string(JSON.stringify({"version": 1, "profiles": profiles, "phrases": phrases}, "\t"))
	return OK

func current() -> Dictionary:
	return profiles[active] if active >= 0 and active < profiles.size() else {}
