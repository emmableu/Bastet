program project

actor Stage is ScratchStage begin 
    image strid "Bühnenbild1" "797b03bdb8cf6ccfc30c0692d533d998.png"
    image strid "Hintergrund-Manege-klein" "79b6284624632e81a5f0bbe203f9df84.svg"
    image strid "Hintergrund-Affenjagd" "38400304784072f5523520c97646fef9.svg"
    sound Plopp "83a9787d4cb6f3b7632b4ddfebf74367.wav"

    define volume as 100
    define layer as 0
    define tempo as 60
    define videoTransparency as 50
    define videoState as "off"

    script on bootstrap do begin 
        changeActiveGraphicTo("Hintergrund-Affenjagd")
    end 

end 

actor Affe is ScratchSprite begin 
    image Affe "7847b73225b11941e978666b709a2c06.svg"
    sound Plopp "83a9787d4cb6f3b7632b4ddfebf74367.wav"

    define volume as 100
    define layer as 1
    define visible as true 
    define x as 111.96100616455078
    define y as (0-104.49691772460938)
    define size as 30
    define direction as 135.1735382080078
    define draggable as false 
    define rotationStyle as "all around"

    script on bootstrap do begin 
        changeActiveGraphicTo("Affe")
    end 

    script on startup do begin 
        repeat forever begin 
            pointTowards(locate actor "Zirkusdirektor-rennend")
            moveSteps(1)
        end 
    end 

end 

actor strid "Zirkusdirektor-rennend" is ScratchSprite begin 
    image strid "Zirkusdirektor-rennend" "a5e99045008feccd3adaca82ccbf27ef.svg"
    sound Plopp "83a9787d4cb6f3b7632b4ddfebf74367.wav"

    define volume as 100
    define layer as 2
    define visible as true 
    define x as 111.12582397460938
    define y as (0-103.65666198730469)
    define size as 50
    define direction as 135.1735382080078
    define draggable as false 
    define rotationStyle as "left-right"

    script on bootstrap do begin 
        changeActiveGraphicTo("Zirkusdirektor-rennend")
    end 

    script on startup do begin 
        repeat forever begin 
            moveSteps(1)
            pointTowards(locate actor "Affe")
        end 
    end 

end 