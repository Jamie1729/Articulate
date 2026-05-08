export type LobbySettings = {
  numTeams: string
  teamAssignment: 'random' | 'host' | 'self'
  minPlayersPerTeam: number
  maxPlayersPerTeam: number
  roundDuration: number
  numSkips: string
  skipBehaviour: 'back' | 'discard'
  winCondition: 'board' | 'rounds'
  boardSize: number
  numRounds: number
  categories: {
    Object: boolean
    Nature: boolean
    Random: boolean
    Person: boolean
    Action: boolean
    World: boolean
  }
  customWords: string
  allowDuplicates: boolean
}
