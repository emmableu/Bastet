program Mini1Program

actor MiniActor is RuntimeEntity begin

    script on startup do begin
        declare b as boolean
        define b as true
        declare x as int
        define x as (cast b to int)
        if not (x = 0) then begin
            _RUNTIME_signalFailure()
        end
    end

end

