// Grid_Manager_TweakpaneSupport.ts

import { Brush, type Brush_ParameterTweakpane } from "./Brush";
import { TweakpaneSupport } from "./TweakpaneSupport";
import type {
  Provide_Tweakpane_To_Props,
  TweakpaneSupport_Props,
  Tweakpane_Items,
} from "./TweakpaneSupport";

export const Grid_Manager_TweakpaneSupport: TweakpaneSupport = {
  provide_tweakpane_to: function (parameter: any, props: Provide_Tweakpane_To_Props): Tweakpane_Items {
    parameter.tweakpane = Object.assign(parameter.tweakpane, {
      grid_show: true,
      grid_rows: 5,
      grid_cols: 5
    });

    const brush_defaults: Brush_ParameterTweakpane = {
      brush_shape: "Rect",
      brush_position_x: 0.5,
      brush_position_y: 0.5,
      brush_scale: 1.0,
      brush_scale_x: 1.0,
      brush_scale_y: 1.0,
      brush_rotate: 0,
      brush_border: 0.0070,
      brush_borderColor: "#efefef7F",
      brush_fillColor: "#efefef7F",
    };

    if (props.items.folder == null) {
      props.items.folder = props.items.pane.addFolder({
        title: "Grid ",
        expanded: false,
      });
    }

    props.items.folder.addBinding(parameter.tweakpane, 'grid_show', { label: 'Show' });
    props.items.folder.addBinding(parameter.tweakpane, 'grid_cols', { label: 'Cols', min: 1, max: 100, step: 1 });
    props.items.folder.addBinding(parameter.tweakpane, 'grid_rows', { label: 'Rows', min: 1, max: 100, step: 1 });
    props.items.folder.addBlade({ view: "separator" });

    const brush_tp_props: Provide_Tweakpane_To_Props = {
      items: {
        pane: props.items.pane,
        folder: null,
        tab: null
      },
      folder_name_prefix: "Grid ",
      use_separator: false,
      parameterSetName: 'grid',
      excludes: [],
      defaults: brush_defaults,
    };

    Grid_Manager_TweakpaneSupport.inject_parameterset_to(parameter);
    props.items.folder = Brush.tweakpaneSupport.provide_tweakpane_to(parameter, brush_tp_props);

    return props.items;
  },

  inject_parameterset_to: function (parameter: any, props?: TweakpaneSupport_Props): void {
    const props_default: TweakpaneSupport_Props = {
      parameterSetName: "grid",
    };
    const targetSet = TweakpaneSupport.ensureParameterSet(parameter, props_default);

    Object.assign(targetSet, {
      show: parameter.tweakpane.grid_show,
      rows: parameter.tweakpane.grid_rows,
      cols: parameter.tweakpane.grid_cols,
      brush: targetSet.brush || {
        shape: "Rect",
        angle: 0,
        scale: 1.0,
        border: parameter.tweakpane.cellBorder,
        borderColor: parameter.tweakpane.cellBorderColor,
        fillColor: parameter.tweakpane.cellFillColor,
      },
    });
  },

  transfer_tweakpane_parameter_to: function (parameter: any, props?: TweakpaneSupport_Props): void {
    const props_default: TweakpaneSupport_Props = {
      parameterSetName: "grid",
    };
    const targetSet = TweakpaneSupport.ensureParameterSet(parameter, props_default);

    targetSet.show = parameter.tweakpane.grid_show;
    targetSet.rows = parameter.tweakpane.grid_rows;
    targetSet.cols = parameter.tweakpane.grid_cols;

    targetSet.brush = targetSet.brush || {};
    targetSet.brush.shape = parameter.tweakpane.grid_brush_shape;
    targetSet.brush.scale = parameter.tweakpane.grid_brush_scale;
    targetSet.brush.angle = parameter.tweakpane.grid_brush_rotate;

    targetSet.brush.border =
      parameter.artwork.canvas.size.width * parameter.tweakpane.grid_brush_border;
    targetSet.brush.fillColor = parameter.tweakpane.grid_brush_fillColor;
    targetSet.brush.borderColor = parameter.tweakpane.grid_brush_borderColor;
  }
};
