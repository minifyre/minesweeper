import matrix from './matrix.js'
import silo from './node_modules/silo/index.js'
import truth from './node_modules/truth/truth.mjs'
import v from './node_modules/v/v.mjs'

const {config,util,logic,output,input}=silo

const
{state}=truth
(
	logic.setup(9,9,5),
	truth.compile(function({state})
	{
		return v.render(document.body,state,output,function({path})
		{
			return path.join('/')==='file/move'
		})
	})
)

onload=()=>logic.shuffle(state)