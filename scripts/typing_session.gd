extends RefCounted

var target: String
var started_ms: int = -1
var ended_ms: int = -1
var attempts: int = 0
var correct_attempts: int = 0
var previous: String = ""
var finished: bool = false

func _init(phrase: String = "") -> void:
	target = phrase

func update_input(value: String, now_ms: int) -> void:
	if finished:
		return
	if started_ms < 0 and not value.is_empty():
		started_ms = now_ms
	# Count inserted characters, including replacements, but not deletions.
	var prefix = 0
	while prefix < mini(previous.length(), value.length()) and previous[prefix] == value[prefix]:
		prefix += 1
	var suffix = 0
	while suffix < mini(previous.length() - prefix, value.length() - prefix) and previous[previous.length() - 1 - suffix] == value[value.length() - 1 - suffix]:
		suffix += 1
	for i in range(prefix, value.length() - suffix):
		attempts += 1
		if i < target.length() and value[i] == target[i]:
			correct_attempts += 1
	previous = value
	if value == target and not target.is_empty():
		finished = true
		ended_ms = now_ms

func stats(now_ms: int) -> Dictionary:
	var elapsed = 0.0 if started_ms < 0 else maxf(0.0, float((ended_ms if finished else now_ms) - started_ms) / 1000.0)
	return {"seconds": elapsed, "attempts": attempts, "precision": 100.0 * correct_attempts / attempts if attempts else 100.0, "cpm": attempts * 60.0 / elapsed if elapsed > 0.0 else 0.0}
