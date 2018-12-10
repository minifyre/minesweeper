input.block=evt=>evt.preventDefault()
input.tile=function(state,evt)
{
	const
	{file}=state,
	target=evt.target,
	i=parseInt(target.id),
	{x,y}=matrix.i2pt(state.file.board,i)

	if(state.file.status!=='started') return

	if(target.nodeName.toLowerCase()!=='span') return 

	if(evt.which===3) logic.toggleTile(state,x,y)

	if(evt.which===1&&file.overlay.array[i]!=='flag')
	{
		if(file.board.array[i]==='mine')
		{
			logic.finish(state,'lose')
			file.overlay.array[i]='bomb'
		}
		else if(file.overlay.array[i]==='hidden') logic.reveal(state,x,y)
	}

	if(file.unrevealed===file.mines) logic.finish(state,'win')
	//@todo turn all remaining hidden tiles to flags

	file.move+=1//@todo do not trigger if an empty tile is clicked
}