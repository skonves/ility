# This code was generated by a tool.
# ility@{{version}}
#
# Changes to this file may cause incorrect behavior and will be lost if
# the code is regenerated.

# typed: strict

require 'typed_struct_helper'

module IlityExample::V1
  class GizmoSize < T::Enum
    enums do
      SMALL = new('small')
      MEDIUM = new('medium')
      LARGE = new('large')
    end
  end
end
