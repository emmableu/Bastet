program project

actor Stage is ScratchStage begin 
    image backdrop1 "cd21514d0531fdffb22204e0ec5ed84a.svg"
    sound pop "83a9787d4cb6f3b7632b4ddfebf74367.wav"

    declare strid "my variable" as float

    define volume as 100
    define layer as 0
    define tempo as 60
    define videoTransparency as 50
    define videoState as "on"
    define strid "my variable" as 0.0

    script on bootstrap do begin 
        changeActiveGraphicTo("backdrop1")
    end 

end 

actor Cat is ScratchSprite begin 
    image costume1 "b7853f557e4426412e64bb3da6531a99.svg"
    image costume2 "e6ddc55a6ddd9cc9d84fe0b4c21e016f.svg"
    sound Meow "83c36d806dc92327b9e7049a565c6bff.wav"

    define volume as 100
    define layer as 1
    define visible as true 
    define x as 126
    define y as 0
    define size as 100
    define direction as 90
    define draggable as false 
    define rotationStyle as "all around"

    script on bootstrap do begin 
        changeActiveGraphicTo("costume1")
    end 

    script on startup do begin 
        repeat forever begin 
            if (keyPressedByCode(39)) then begin 
                moveSteps(10)
            end 
        end 
    end 

end 
