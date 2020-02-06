program Task6Spec

/**
 * ## Task 8 „Cat touching Ball“
 *
 * Task: The `cat` should `say` "Hab ich dich!" when it touches a ball.
 *
 * Rewrite as bounded safety property:
 *      The cat must always say "Hab ich dich!" whenever it touches the ball.
 *
 * Precondition:
 *      There exists two actors, one with the role of
 *      the cat and one in the role of the ball.
 *
 * Interpretations and considerations:
 *   - Neither ball nor cat have to be able to move
 *
 * Rewrite without explicit actor names:
 *    Given two actors, at least one of them always says "Hab ich dich!" when
 *    actors touch
 *
 *   EXISTS a in _RUNTIME_getAllActors():
 *     EXISTS b in _RUNTIME_getAllActors(), with b != a:
 *       FORALL trace in PROGRMA_TRACES:
 *         if touching(a,b)
 *           issaying(a, "Hab ich dich!") or issaying(b, "Hab ich dich")
 *
 */

actor DirectorObserver is Observer begin

    declare observer_state as enum ["INIT", "BOOTSTRAP_FINISHED"]

    declare actor_1_id as string
    declare actor_2_id as string

    declare actors_touching as boolean


    define atomic checkBehaviorSatisfied () begin
        define result as false

            if spritesTouching() then begin
                if attribute "bubbleText" of actor_1_id = "Hab ich dich!" then begin
                    define result as true
                end else begin attribute "bubbleText" of actor_2_id = "Hab ich dich!"
                    define result as true
                end
            end

        // The actual invariant check
        assert (result)
    end returns result: boolean

    define atomic storeRelevantStateInfosForNext () begin

    end

    define atomic spritesTouching() begin
         define actor_1_graphics as attribute "active_graphic_pixels" of actor_1_id
         define actor_2_graphics as attribute "active_graphic_pixels" of actor_2_id

         declare result as boolean
         define result as true

         declare i as number
         define i as 0

         until i = length of actor_1_graphics begin
            if item i of actor_1_gr

         end

         if item (_RUNTIME_getMouseX () * _RUNTIME_getMouseX () ) of actor_1_id = 0 begin //todo is 0 the default value
             define result as false
         end

      end returns result: boolean


    script on bootstrap do begin
        define observer_state as "INIT"
    end

    script on bootstrap finished do begin
        define observer_state as "BOOTSTRAP_FINISHED"

        // First specification check (base condition)
        assert(checkBehaviorSatisfied())

        // Store the relevant attributes
        storeRelevantStateInfosForNext()
    end

    script on statement finished do begin
        if observer_state = "BOOTSTRAP_FINISHED" then begin
            // The actual specification check
            assert(checkBehaviorSatisfied())
        end

        // Store the relevant attributes
        storeRelevantStateInfosForNext()
    end

end

