program Mini1Program

actor MiniActor is RuntimeEntity begin

    script on startup do begin
        declare a as int
        declare b as int
        define a as 0
        define b as 0
        if a + b = 0 then begin
        end else begin
            _RUNTIME_signalFailure()
        end
    end

end

