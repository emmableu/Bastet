program project

actor Stage is ScratchStage begin
    script on bootstrap do begin
    end

end

actor Cat is ScratchSprite begin
    define x as 126
    define y as 0
    define size as 100
    define direction as 90
    define draggable as false
    define rotationStyle as "all around"

    script on bootstrap do begin
    end

    script on startup do begin
        repeat forever begin
            if (keyPressedByCode(39)) then begin
                moveSteps(10)
            end
        end
    end

end
