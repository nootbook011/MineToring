import { BaseModule } from '#Storage/moduleBase'

export default class PacketsMain extends BaseModule {
    options
    constructor(clientGetter, Options) {
        super(clientGetter)
        this.options = Options
    }
    
    connectHandler() {
        
    }
    
    disconnectHandler() {
        
    }
    
}