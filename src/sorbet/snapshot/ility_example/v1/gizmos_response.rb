# This code was generated by a tool.
# ility@0.0.3
#
# Changes to this file may cause incorrect behavior and will be lost if
# the code is regenerated.

# typed: strict

require 'typed_struct_helper'

module IlityExample::V1
  class GizmosResponse < T::Struct
    extend T::Sig
    include TypedStructHelper

    const data, T::Array[IlityExample::V1::Gizmo]
  end
end
