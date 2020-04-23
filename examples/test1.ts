export class SomeTypescriptClass {

    trPrefix = 'a.b.';
    other = 'test123';

    constructor(public route: RouteService, private translation: TranslationService) {
        this.translation.getStatic(this.trPrefix + 'abc', 'Wartość domyślna');
    }

    methodOne() {
        this.translation.getStatic('a.b.c.d', 'Inny tekst');

        let variable = {
            test: this.translation.getStatic('a.f.g.h.h')
        };

        let anonymous = () => {
            this.other = this.translation.getStatic('aaaa');
            let a = (ala) => { 
            this.translation.getStatic(this.trPrefix + 'test', 'domyślna', {some: 'thing'});
            }
        };
    }
}