program CatMoveSpec

actor CatObserver is Observer begin

    declare catX as int
    declare prevX as int
    declare cat as actor
    declare game_start_time as int
    declare keyboard_trigger as boolean


    define atomic checkBehaviorSatisfied () begin
        define catX as cast attribute "x" of cat to int
        define keyboard_trigger as keyPressedByCode(39)

        if keyboard_trigger then begin
            if catX < prevX then begin
                _RUNTIME_signalFailure("cat not moving right")
            end
        end

        if _RUNTIME_micros() - game_start_time > 100000 then begin
           _RUNTIME_signalFailure("The cat must move right.")
        end

        define prevX as catX
    end

    script on bootstrap finished do begin
        define cat as locate actor "Cat"
        define prevX as cast attribute "x" of cat to int
        define game_start_time as _RUNTIME_micros()
        checkBehaviorSatisfied()
    end

    script on statement finished do begin
        checkBehaviorSatisfied()
    end

end

