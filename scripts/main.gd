extends Control

const Store = preload("res://scripts/store.gd")
const Session = preload("res://scripts/typing_session.gd")
var store = Store.new()
var body: VBoxContainer
var session: RefCounted
var metrics: Label
var feedback: Label
var input: LineEdit
var audio: AudioStreamPlayer
var recorded = false

func _ready() -> void:
	store.load_data()
	var theme = Theme.new()
	theme.default_font_size = 22
	self.theme = theme
	var margin = MarginContainer.new()
	margin.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	for side in ["left", "right", "top", "bottom"]:
		margin.add_theme_constant_override("margin_" + side, 32)
	add_child(margin)
	var scroll = ScrollContainer.new()
	margin.add_child(scroll)
	body = VBoxContainer.new()
	body.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	body.add_theme_constant_override("separation", 16)
	scroll.add_child(body)
	audio = AudioStreamPlayer.new()
	add_child(audio)
	show_home()

func clear_page(title: String) -> void:
	session = null
	for child in body.get_children():
		body.remove_child(child)
		child.queue_free()
	label(title, 34)

func label(text: String, font_size: int = 22) -> Label:
	var node = Label.new()
	node.text = text
	node.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	node.add_theme_font_size_override("font_size", font_size)
	body.add_child(node)
	return node

func button(text: String, action: Callable, disabled: bool = false) -> Button:
	var node = Button.new()
	node.text = text
	node.custom_minimum_size.y = 52
	node.disabled = disabled
	node.pressed.connect(action)
	body.add_child(node)
	return node

func save() -> bool:
	if store.save_data() != OK:
		label("La sauvegarde a échoué. Vérifiez l’accès au dossier utilisateur.")
		return false
	return true

func show_home() -> void:
	clear_page("DéfilOrdi · L’aventure du clavier")
	label("Choisis ton profil, puis pars explorer les touches !")
	if not store.profiles.is_empty():
		var choices = OptionButton.new()
		for profile in store.profiles:
			choices.add_item(profile.name)
		choices.select(store.active)
		choices.item_selected.connect(func(index): store.active = index; show_home())
		body.add_child(choices)
		var profile = store.current()
		var avatar = label(profile.avatar + " · " + profile.name, 30)
		avatar.modulate = Color(profile.color)
	button("Créer un profil", func(): show_profile(true))
	button("Personnaliser mon profil", func(): show_profile(false), store.active < 0)
	button("Jouer · Dactylographie", show_typing, store.active < 0 or store.phrases.is_empty())
	button("Espace ergothérapeute · Phrases", show_phrases)
	button("Mes résultats", show_history, store.active < 0)
	label("Bientôt : mémoire des mots · couleurs · petit bac · lettres de l’espace", 18)
	label("V0 · Données locales · Aucun compte en ligne", 16)

func show_profile(is_new: bool) -> void:
	clear_page("Mon personnage")
	var profile = {} if is_new else store.current()
	label("Ton pseudonyme")
	var name_input = LineEdit.new()
	name_input.placeholder_text = "Exemple : Étoile bleue"
	name_input.max_length = 40
	name_input.text = profile.get("name", "")
	body.add_child(name_input)
	label("Ton personnage")
	var avatars = OptionButton.new()
	for avatar in ["Robot", "Chat", "Astronaute", "Renard"]:
		avatars.add_item(avatar)
		if avatar == profile.get("avatar", "Robot"):
			avatars.select(avatars.item_count - 1)
	body.add_child(avatars)
	label("Ta couleur préférée")
	var color = ColorPickerButton.new()
	color.color = Color(profile.get("color", "#75c9ff"))
	color.edit_alpha = false
	body.add_child(color)
	label("Son de réussite")
	var sounds = OptionButton.new()
	for sound in ["Silence", "Clochette", "Spatial"]:
		sounds.add_item(sound)
	sounds.select(profile.get("sound", 1))
	body.add_child(sounds)
	button("Écouter", func(): play_sound(sounds.selected))
	var message = label("")
	button("Enregistrer", func():
		var nickname = name_input.text.strip_edges()
		if nickname.is_empty():
			message.text = "Choisis un pseudonyme pour continuer."
			return
		var data = {"name": nickname, "avatar": avatars.get_item_text(avatars.selected), "color": color.color.to_html(false), "sound": sounds.selected, "results": profile.get("results", [])}
		if is_new:
			store.profiles.append(data)
			store.active = store.profiles.size() - 1
		else:
			store.profiles[store.active] = data
		if save(): show_home()
	)
	button("Retour", show_home)

func play_sound(choice: int) -> void:
	if choice == 0:
		return
	var wave = AudioStreamWAV.new()
	wave.format = AudioStreamWAV.FORMAT_16_BITS
	wave.mix_rate = 22050
	var bytes = PackedByteArray()
	bytes.resize(6615 * 2)
	for i in range(6615):
		var t = float(i) / 22050.0
		var frequency = 880.0 if choice == 1 else 440.0 + t * 1800.0
		var sample = int(sin(TAU * frequency * t) * 7000.0 * (1.0 - float(i) / 6615.0))
		bytes.encode_s16(i * 2, sample)
	wave.data = bytes
	audio.stream = wave
	audio.play()

func show_phrases() -> void:
	clear_page("Les phrases de nos aventures")
	label("Une phrase par ligne. Les accents et la ponctuation font partie de l’exercice.")
	var editor = TextEdit.new()
	editor.custom_minimum_size.y = 260
	editor.text = "\n".join(store.phrases)
	body.add_child(editor)
	var message = label("")
	button("Enregistrer les phrases", func():
		var phrases: Array = []
		for line in editor.text.split("\n"):
			if not line.strip_edges().is_empty(): phrases.append(line.strip_edges())
		if phrases.is_empty():
			message.text = "Ajoute au moins une phrase."
			return
		store.phrases = phrases
		if save(): message.text = "Phrases enregistrées."
	)
	button("Retour au menu", show_home)

func show_typing() -> void:
	clear_page("À toi de taper !")
	label("Choisis une phrase. Le chronomètre démarre à la première saisie.")
	var choices = OptionButton.new()
	for phrase in store.phrases:
		choices.add_item(phrase)
	body.add_child(choices)
	var target = label(store.phrases[0], 28)
	target.modulate = Color(store.current().color)
	input = LineEdit.new()
	input.placeholder_text = "Recopie la phrase ici…"
	input.context_menu_enabled = false
	input.shortcut_keys_enabled = false
	body.add_child(input)
	metrics = label("")
	feedback = label("Prends ton temps. Tu peux corriger avec Retour arrière.")
	session = Session.new(store.phrases[0])
	recorded = false
	choices.item_selected.connect(func(index):
		target.text = store.phrases[index]
		session = Session.new(target.text)
		recorded = false
		input.clear()
		input.editable = true
		feedback.text = "À toi de jouer !"
		input.grab_focus()
	)
	input.text_changed.connect(on_typed)
	button("Recommencer", func(): choices.item_selected.emit(choices.selected))
	button("Retour au menu", show_home)
	input.grab_focus()

func on_typed(value: String) -> void:
	session.update_input(value, Time.get_ticks_msec())
	if session.finished and not recorded:
		recorded = true
		input.editable = false
		feedback.text = "Bravo ! Tu as terminé la phrase."
		var result = session.stats(Time.get_ticks_msec())
		result["phrase"] = session.target
		result["date"] = Time.get_datetime_string_from_system()
		store.current().results.append(result)
		save()
		play_sound(store.current().sound)
	elif not session.finished:
		feedback.text = "Tu peux corriger tranquillement." if not session.target.begins_with(value) else "Continue comme ça !"

func _process(_delta: float) -> void:
	if session != null and is_instance_valid(metrics):
		var stats = session.stats(Time.get_ticks_msec())
		metrics.text = "Temps : %.1f s    ·    Frappes/min : %.0f    ·    Précision : %.0f %%" % [stats.seconds, stats.cpm, stats.precision]

func show_history() -> void:
	clear_page("Les progrès de " + store.current().name)
	var results = store.current().results
	if results.is_empty(): label("Tes prochaines aventures apparaîtront ici.")
	for i in range(results.size() - 1, -1, -1):
		var result = results[i]
		label("%s · %.1f s · %.0f frappes/min · %.0f %%\n%s" % [result.date, result.seconds, result.cpm, result.precision, result.phrase], 18)
	button("Retour au menu", show_home)
