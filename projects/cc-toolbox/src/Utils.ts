export class Utils {

    /**
     * Überschreibt das proprty in default, wenn das source objekt exist,
     * und das source property exist.
     */
    public static set_property_if_exist(defaults: any, source:any, property_name: string): void {
        if (source != null) {
            if (source.hasOwnProperty(property_name)) {
                defaults[property_name] = source[property_name];
            }
        }
    }
}