program Mini1Program

actor MiniActor is RuntimeEntity begin

    script on startup do begin
        declare rad as number
        define rad as 5

        declare deg as number
        define deg as radToDeg(rad)

        if deg < 286 or deg > 287 then begin
            _RUNTIME_signalFailure()
        end
    end

end
