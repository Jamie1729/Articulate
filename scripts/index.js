setup = document.getElementById('setup')
setup.onsubmit = async (event) => {
    event.preventDefault()
    const num_teams = setup.num_teams.value
    const mode = setup.mode.value
    const card_set = setup.card_set.value
    game_init(num_teams, mode, card_set)
}